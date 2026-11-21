import { addPerformance, bestOverallScore, recentHistory, songsPlayed } from './PerformanceHistory.js';
import { calculateRewards } from './RewardSystem.js';
import { loadSave, writeSave } from './SaveStorage.js';

// Gerencia a carreira do jogador: dinheiro, fama, histórico e recordes, sempre sincronizados
// com o salvamento. É a única porta de entrada para alterar a progressão: as cenas só chamam
// `recordPerformance` (ao CONCLUIR uma apresentação) e leem os valores.
//
// Cada apresentação tem um `runId`. Registrar o mesmo runId duas vezes (evento duplicado,
// tela de resultados recriada) não paga nada de novo: devolve o registro já existente.
export default class CareerProgress {
    constructor(storage, now = () => new Date()) {
        this.storage = storage;
        this.now = now;
        const { save, status, writable } = loadSave(storage, now);
        this.save = save;
        this.status = status;
        this.writable = writable;
    }

    persist() {
        if (this.writable) this.writable = writeSave(this.storage, this.save);
    }

    get careerId() {
        return this.save.careerId;
    }

    get money() {
        return this.save.money;
    }

    get fame() {
        return this.save.fame;
    }

    get hasCareer() {
        return Boolean(this.save.careerId);
    }

    setCareer(careerId) {
        this.save.careerId = careerId;
        this.persist();
    }

    // Registra uma apresentação concluída e paga as recompensas. `score` é o ScoreSystem.
    // Retorna { entry, newRecords, duplicate }.
    recordPerformance({ runId, song, score, totalNotes }) {
        const existing = this.save.history.find((entry) => entry.id === runId);
        if (existing) return { entry: existing, newRecords: { score: false, accuracy: false }, duplicate: true };

        const accuracy = Math.round(score.accuracy * 10) / 10;
        const rewards = calculateRewards({
            score: score.score,
            accuracy,
            maxCombo: score.maxCombo,
            totalNotes,
            difficulty: song.difficulty
        });

        const entry = {
            id: runId,
            songId: song.id,
            songTitle: song.title,
            date: this.now().toISOString(),
            score: score.score,
            accuracy,
            maxCombo: score.maxCombo,
            perfect: score.counts.PERFECT,
            good: score.counts.GOOD,
            miss: score.counts.MISS,
            difficulty: song.difficulty,
            money: rewards.money,
            fame: rewards.fame
        };

        const newRecords = addPerformance(this.save, entry);
        this.save.money += rewards.money;
        this.save.fame += rewards.fame;
        this.persist();
        return { entry, newRecords, duplicate: false };
    }

    // Dados para a tela de STATUS.
    get summary() {
        return {
            money: this.save.money,
            fame: this.save.fame,
            performances: this.save.stats.performances,
            songsPlayed: songsPlayed(this.save),
            bestScore: bestOverallScore(this.save),
            records: this.save.records,
            recent: recentHistory(this.save, 6)
        };
    }
}

function browserStorage() {
    try {
        return window.localStorage;
    } catch {
        return null;
    }
}

let shared = null;

// Instância única usada pelo jogo (criada na primeira vez que é pedida).
export const getCareerProgress = () => (shared ??= new CareerProgress(browserStorage()));
