import { createRecord } from './PerformanceHistory.js';

// Salvamento local (localStorage). Tudo fica em uma única chave, em JSON:
//
//   {
//     version: 1,                      formato do salvamento (para migrações futuras)
//     careerId: 'guitarist' | null,    carreira escolhida
//     money: 0, fame: 0,               recursos acumulados (inteiros >= 0)
//     stats: { performances: 0 },      total de apresentações concluídas (nunca diminui)
//     history: [ {                     até MAX_HISTORY apresentações, da mais antiga à mais nova
//        id, songId, songTitle, date (ISO), score, accuracy (0-100), maxCombo,
//        perfect, good, miss, difficulty (1-3), money, fame } ],
//     records: { [songId]: { plays, bestScore, bestScoreDate, bestAccuracy, bestAccuracyDate } }
//   }
//
// Cuidados:
//  - Sem dados salvos: começa uma carreira nova (status 'new').
//  - Dados corrompidos/inválidos: uma cópia do texto original é guardada em outra chave
//    (`<chave>.corrompido-<data>`) antes de qualquer gravação, e o jogo começa do zero ('recovered').
//  - Salvamento de versão MAIS NOVA que a deste jogo: é usado em memória, mas nunca regravado,
//    para não destruir dados que este código não entende ('future').
//  - localStorage indisponível (modo privado, bloqueado): o jogo funciona só em memória.

export const SAVE_KEY = 'jogo-musical:save';
export const SAVE_VERSION = 1;

// Migrações do formato antigo para o seguinte: MIGRATIONS[n] converte a versão n em n+1.
const MIGRATIONS = {};

export function createEmptySave() {
    return {
        version: SAVE_VERSION,
        careerId: null,
        money: 0,
        fame: 0,
        stats: { performances: 0 },
        history: [],
        records: {}
    };
}

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const count = (value) => (Number.isFinite(value) && value > 0 ? Math.floor(value) : 0);
const clamp = (value, min, max) => (Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min);
const validDate = (value) => (typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? value : null);

function sanitizeEntry(raw) {
    if (!isObject(raw) || typeof raw.id !== 'string' || typeof raw.songId !== 'string' || !raw.songId) return null;
    const date = validDate(raw.date);
    if (!date) return null;

    return {
        id: raw.id,
        songId: raw.songId,
        songTitle: typeof raw.songTitle === 'string' ? raw.songTitle : raw.songId,
        date,
        score: count(raw.score),
        accuracy: clamp(raw.accuracy, 0, 100),
        maxCombo: count(raw.maxCombo),
        perfect: count(raw.perfect),
        good: count(raw.good),
        miss: count(raw.miss),
        difficulty: clamp(Math.round(raw.difficulty), 1, 3),
        money: count(raw.money),
        fame: count(raw.fame)
    };
}

function sanitizeRecord(raw) {
    if (!isObject(raw)) return null;
    return {
        ...createRecord(),
        plays: count(raw.plays),
        bestScore: count(raw.bestScore),
        bestScoreDate: validDate(raw.bestScoreDate),
        bestAccuracy: clamp(raw.bestAccuracy, 0, 100),
        bestAccuracyDate: validDate(raw.bestAccuracyDate)
    };
}

// Converte um objeto lido do disco em um salvamento válido (descartando só o que for inválido).
// Devolve null se o objeto não for um salvamento reconhecível.
export function sanitizeSave(raw) {
    if (!isObject(raw)) return null;

    const history = (Array.isArray(raw.history) ? raw.history : []).map(sanitizeEntry).filter(Boolean);
    const records = {};
    if (isObject(raw.records)) {
        Object.entries(raw.records).forEach(([songId, record]) => {
            const clean = sanitizeRecord(record);
            if (clean) records[songId] = clean;
        });
    }

    const performances = isObject(raw.stats) ? count(raw.stats.performances) : 0;
    return {
        version: SAVE_VERSION,
        careerId: typeof raw.careerId === 'string' && raw.careerId ? raw.careerId : null,
        money: count(raw.money),
        fame: count(raw.fame),
        stats: { performances: Math.max(performances, history.length) },
        history,
        records
    };
}

// Guarda uma cópia do texto inválido (sem apagar nada) e recomeça com uma carreira nova.
function recover(storage, rawText, now) {
    let writable = true;
    try {
        storage.setItem(`${SAVE_KEY}.corrompido-${now().toISOString()}`, rawText);
    } catch {
        // Sem espaço para a cópia: não regrava por cima, para não perder o original.
        writable = false;
    }
    return { save: createEmptySave(), status: 'recovered', writable };
}

// Lê o salvamento. Retorna { save, status, writable }
// (status: 'new' | 'loaded' | 'recovered' | 'future'; writable: se pode gravar por cima).
export function loadSave(storage, now = () => new Date()) {
    let rawText;
    try {
        rawText = storage ? storage.getItem(SAVE_KEY) : null;
    } catch {
        return { save: createEmptySave(), status: 'new', writable: false };
    }
    if (rawText === null || rawText === undefined) {
        return { save: createEmptySave(), status: 'new', writable: Boolean(storage) };
    }

    let parsed;
    try {
        parsed = JSON.parse(rawText);
    } catch {
        return recover(storage, rawText, now);
    }

    const version = isObject(parsed) ? parsed.version : undefined;
    if (!Number.isInteger(version) || version < 1) return recover(storage, rawText, now);

    if (version > SAVE_VERSION) {
        // Versão futura: lê o que for possível, mas não grava por cima.
        return { save: sanitizeSave(parsed) ?? createEmptySave(), status: 'future', writable: false };
    }

    let current = parsed;
    for (let v = version; v < SAVE_VERSION; v++) current = MIGRATIONS[v](current);
    const save = sanitizeSave(current);
    return save ? { save, status: 'loaded', writable: true } : recover(storage, rawText, now);
}

// Grava o salvamento. Retorna false se não foi possível (o jogo continua em memória).
export function writeSave(storage, save) {
    try {
        storage.setItem(SAVE_KEY, JSON.stringify(save));
        return true;
    } catch {
        return false;
    }
}
