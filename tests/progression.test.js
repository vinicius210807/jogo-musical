import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SONGS } from '../src/data/songs.js';
import CareerProgress from '../src/systems/CareerProgress.js';
import { MAX_HISTORY } from '../src/systems/PerformanceHistory.js';
import { calculateRewards } from '../src/systems/RewardSystem.js';
import { SAVE_KEY, SAVE_VERSION } from '../src/systems/SaveStorage.js';
import ScoreSystem from '../src/systems/ScoreSystem.js';

const [riff, neon, lastShow] = SONGS;

// localStorage falso, só para os testes.
class FakeStorage {
    constructor(initial = {}) {
        this.data = { ...initial };
        this.failWrites = false;
    }
    getItem(key) {
        return key in this.data ? this.data[key] : null;
    }
    setItem(key, value) {
        if (this.failWrites) throw new Error('quota');
        this.data[key] = String(value);
    }
}

// Placar com `perfect`, `good` e `miss` notas (como se tivessem sido tocadas nessa ordem).
function playScore(perfect, good = 0, miss = 0) {
    const score = new ScoreSystem();
    for (let i = 0; i < perfect; i++) score.register('PERFECT');
    for (let i = 0; i < good; i++) score.register('GOOD');
    for (let i = 0; i < miss; i++) score.register('MISS');
    return score;
}

let runCounter = 0;
const perform = (career, song, score, runId = `run-${++runCounter}`) =>
    career.recordPerformance({ runId, song, score, totalNotes: score.totalJudged });

// --- Recompensas ---

test('apresentação concluída gera dinheiro e fama positivos', () => {
    const rewards = calculateRewards({ score: 5000, accuracy: 50, maxCombo: 20, totalNotes: 100, difficulty: 1 });
    assert.ok(rewards.money > 0);
    assert.ok(rewards.fame >= 1);
    assert.ok(Number.isInteger(rewards.money) && Number.isInteger(rewards.fame));
});

test('desempenho melhor paga mais, na mesma música', () => {
    const base = { totalNotes: 111, difficulty: 1 };
    const bad = calculateRewards({ ...base, score: 3000, accuracy: 27, maxCombo: 5 });
    const ok = calculateRewards({ ...base, score: 8000, accuracy: 72, maxCombo: 40 });
    const perfect = calculateRewards({ ...base, score: 11100, accuracy: 100, maxCombo: 111 });
    assert.ok(bad.money < ok.money && ok.money < perfect.money);
    assert.ok(bad.fame < ok.fame && ok.fame < perfect.fame);
});

test('dificuldade maior paga mais com o mesmo desempenho', () => {
    const same = { score: 10000, accuracy: 90, maxCombo: 80, totalNotes: 100 };
    const easy = calculateRewards({ ...same, difficulty: 1 });
    const medium = calculateRewards({ ...same, difficulty: 2 });
    const hard = calculateRewards({ ...same, difficulty: 3 });
    assert.ok(easy.money < medium.money && medium.money < hard.money);
    assert.ok(easy.fame < medium.fame && medium.fame < hard.fame);
});

test('valores documentados da fórmula (apresentação perfeita)', () => {
    const perfect = (song, notes) => calculateRewards({ score: notes * 100, accuracy: 100, maxCombo: notes, totalNotes: notes, difficulty: song.difficulty });
    assert.deepEqual(perfect(riff, 111), { money: 317, fame: 14 });
    assert.deepEqual(perfect(neon, 69), { money: 380, fame: 21 });
    assert.deepEqual(perfect(lastShow, 227), { money: 981, fame: 28 });
});

test('entradas estranhas nunca geram valores negativos ou inválidos', () => {
    [
        { score: -50, accuracy: -10, maxCombo: -3, totalNotes: 0, difficulty: 1 },
        { score: NaN, accuracy: Infinity, maxCombo: 999, totalNotes: 10, difficulty: 99 },
        {}
    ].forEach((input) => {
        const { money, fame } = calculateRewards(input);
        assert.ok(Number.isInteger(money) && money >= 0);
        assert.ok(Number.isInteger(fame) && fame >= 1);
    });
});

// --- Carreira, histórico e recordes ---

test('apresentação concluída soma dinheiro e fama e grava o histórico completo', () => {
    const storage = new FakeStorage();
    const career = new CareerProgress(storage, () => new Date('2026-01-02T10:00:00Z'));
    const { entry, duplicate } = perform(career, riff, playScore(100, 5, 6));

    assert.equal(duplicate, false);
    assert.equal(career.money, entry.money);
    assert.equal(career.fame, entry.fame);
    assert.deepEqual(
        { songId: entry.songId, songTitle: entry.songTitle, date: entry.date, difficulty: entry.difficulty, perfect: entry.perfect, good: entry.good, miss: entry.miss },
        { songId: 'riff-da-garagem', songTitle: 'RIFF DA GARAGEM', date: '2026-01-02T10:00:00.000Z', difficulty: 1, perfect: 100, good: 5, miss: 6 }
    );
    assert.equal(entry.score, 100 * 100 + 5 * 50);
    assert.equal(entry.maxCombo, 105);
    assert.ok(entry.accuracy > 90 && entry.accuracy <= 100);
    assert.equal(career.summary.performances, 1);
});

test('a mesma apresentação (mesmo runId) é contabilizada uma única vez', () => {
    const storage = new FakeStorage();
    const career = new CareerProgress(storage);
    const score = playScore(50, 5, 5);
    const first = perform(career, riff, score, 'mesma-run');
    const moneyAfterFirst = career.money;
    const second = perform(career, riff, score, 'mesma-run');

    assert.equal(second.duplicate, true);
    assert.equal(second.entry.id, first.entry.id);
    assert.equal(career.money, moneyAfterFirst);
    assert.equal(career.summary.performances, 1);
    assert.equal(career.save.history.length, 1);
});

test('replay (novo runId) soma só a nova apresentação, sem repetir a anterior', () => {
    const career = new CareerProgress(new FakeStorage());
    const a = perform(career, riff, playScore(60, 10, 10)).entry;
    const b = perform(career, riff, playScore(80, 5, 5)).entry;
    assert.equal(career.money, a.money + b.money);
    assert.equal(career.fame, a.fame + b.fame);
    assert.equal(career.summary.performances, 2);
});

test('sem apresentação concluída não há recompensa (abandonar não registra nada)', () => {
    const storage = new FakeStorage();
    const career = new CareerProgress(storage);
    career.setCareer('guitarist'); // escolher a carreira não paga nada
    assert.equal(career.money, 0);
    assert.equal(career.fame, 0);
    assert.equal(career.summary.performances, 0);
    assert.equal(career.save.history.length, 0);
});

test('recordes pessoais por música: maior pontuação e melhor precisão', () => {
    const career = new CareerProgress(new FakeStorage());
    const first = perform(career, riff, playScore(50, 20, 40)); // primeira vez: recorde
    assert.deepEqual(first.newRecords, { score: true, accuracy: true });

    const better = perform(career, riff, playScore(90, 10, 10));
    assert.deepEqual(better.newRecords, { score: true, accuracy: true });

    const worse = perform(career, riff, playScore(30, 10, 70));
    assert.deepEqual(worse.newRecords, { score: false, accuracy: false });

    const record = career.summary.records[riff.id];
    assert.equal(record.plays, 3);
    assert.equal(record.bestScore, 90 * 100 + 10 * 50);
    assert.ok(record.bestAccuracy > 85);

    // Outra música tem o seu próprio recorde.
    const other = perform(career, neon, playScore(10, 0, 59));
    assert.deepEqual(other.newRecords, { score: true, accuracy: true });
    assert.equal(career.summary.songsPlayed, 2);
    assert.equal(career.summary.bestScore, 90 * 100 + 10 * 50);
});

test('histórico recente vem da mais nova para a mais antiga e é limitado', () => {
    const career = new CareerProgress(new FakeStorage());
    for (let i = 0; i < MAX_HISTORY + 5; i++) perform(career, riff, playScore(10 + i, 0, 0), `h-${i}`);
    assert.equal(career.save.history.length, MAX_HISTORY);
    assert.equal(career.summary.performances, MAX_HISTORY + 5); // o total não diminui
    assert.equal(career.summary.recent[0].id, `h-${MAX_HISTORY + 4}`);
    assert.equal(career.summary.recent.length, 6);
});

// --- Salvamento ---

test('sem dados salvos começa uma carreira nova, zerada', () => {
    const career = new CareerProgress(new FakeStorage());
    assert.equal(career.status, 'new');
    assert.equal(career.money, 0);
    assert.equal(career.fame, 0);
    assert.equal(career.hasCareer, false);
});

test('dados persistem ao recarregar (nova instância sobre o mesmo storage)', () => {
    const storage = new FakeStorage();
    const before = new CareerProgress(storage);
    before.setCareer('drummer');
    const { entry } = perform(before, neon, playScore(40, 10, 19));

    const after = new CareerProgress(storage);
    assert.equal(after.status, 'loaded');
    assert.equal(after.careerId, 'drummer');
    assert.equal(after.money, entry.money);
    assert.equal(after.fame, entry.fame);
    assert.deepEqual(after.save.history, before.save.history);
    assert.deepEqual(after.save.records, before.save.records);
    assert.equal(JSON.parse(storage.data[SAVE_KEY]).version, SAVE_VERSION);

    // E o runId antigo continua protegido contra dupla contagem depois de recarregar.
    const again = after.recordPerformance({ runId: entry.id, song: neon, score: playScore(40, 10, 19), totalNotes: 69 });
    assert.equal(again.duplicate, true);
    assert.equal(after.money, entry.money);
});

test('dados corrompidos: começa do zero e guarda uma cópia do original', () => {
    const storage = new FakeStorage({ [SAVE_KEY]: '{isso nao e json' });
    const career = new CareerProgress(storage, () => new Date('2026-05-05T00:00:00Z'));
    assert.equal(career.status, 'recovered');
    assert.equal(career.money, 0);

    const backups = Object.keys(storage.data).filter((key) => key.startsWith(`${SAVE_KEY}.corrompido-`));
    assert.equal(backups.length, 1);
    assert.equal(storage.data[backups[0]], '{isso nao e json');

    perform(career, riff, playScore(10)); // novo jogo grava normalmente
    assert.equal(storage.data[backups[0]], '{isso nao e json'); // a cópia segue intacta
});

test('JSON válido, mas sem versão ou do tipo errado, também é tratado como inválido', () => {
    ['[]', '"texto"', '42', '{"money": 500}', '{"version": "1"}', '{"version": 0}', 'null'].forEach((raw) => {
        const storage = new FakeStorage({ [SAVE_KEY]: raw });
        const career = new CareerProgress(storage);
        assert.equal(career.status, 'recovered', raw);
        assert.equal(career.money, 0);
        assert.ok(Object.keys(storage.data).some((key) => key.includes('corrompido')), raw);
    });
});

test('campos inválidos dentro de um salvamento válido são corrigidos, sem valores negativos', () => {
    const raw = {
        version: 1,
        careerId: 'guitarist',
        money: -300,
        fame: 'muito',
        stats: { performances: -4 },
        history: [
            { id: 'ok', songId: 'riff-da-garagem', songTitle: 'RIFF', date: '2026-01-01T00:00:00Z', score: 100, accuracy: 250, maxCombo: 3, perfect: 1, good: 0, miss: 0, difficulty: 1, money: 10, fame: 2 },
            { id: 'sem-musica', date: '2026-01-01T00:00:00Z' },
            'lixo'
        ],
        records: { 'riff-da-garagem': { plays: 1, bestScore: -5, bestAccuracy: 400 }, ruim: 'x' }
    };
    const career = new CareerProgress(new FakeStorage({ [SAVE_KEY]: JSON.stringify(raw) }));
    assert.equal(career.status, 'loaded');
    assert.equal(career.careerId, 'guitarist');
    assert.equal(career.money, 0);
    assert.equal(career.fame, 0);
    assert.equal(career.save.history.length, 1);
    assert.equal(career.save.history[0].accuracy, 100);
    assert.equal(career.save.stats.performances, 1);
    assert.equal(career.save.records['riff-da-garagem'].bestScore, 0);
    assert.equal(career.save.records['riff-da-garagem'].bestAccuracy, 100);
    assert.equal(career.save.records.ruim, undefined);
});

test('versão futura do salvamento é lida, mas nunca sobrescrita', () => {
    const future = JSON.stringify({ version: SAVE_VERSION + 1, careerId: 'singer', money: 777, fame: 9, novidade: { x: 1 } });
    const storage = new FakeStorage({ [SAVE_KEY]: future });
    const career = new CareerProgress(storage);
    assert.equal(career.status, 'future');
    assert.equal(career.money, 777);

    perform(career, riff, playScore(20));
    career.setCareer('bassist');
    assert.equal(storage.data[SAVE_KEY], future);
});

test('falha ao gravar (sem espaço) não derruba o jogo', () => {
    const storage = new FakeStorage();
    const career = new CareerProgress(storage);
    storage.failWrites = true;
    assert.doesNotThrow(() => perform(career, riff, playScore(20)));
    assert.ok(career.money > 0); // segue em memória
});

test('sem localStorage (null) o jogo funciona só em memória', () => {
    const career = new CareerProgress(null);
    assert.equal(career.status, 'new');
    assert.doesNotThrow(() => perform(career, riff, playScore(20)));
    assert.ok(career.money > 0);
});
