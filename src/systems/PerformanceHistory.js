// Histórico de apresentações e recordes pessoais. Lógica pura sobre os dados do salvamento
// (sem Phaser nem localStorage). Veja SaveStorage.js para o formato dos dados.

export const MAX_HISTORY = 100; // apresentações guardadas (as mais antigas saem; os totais continuam)

export function createRecord() {
    return { plays: 0, bestScore: 0, bestScoreDate: null, bestAccuracy: 0, bestAccuracyDate: null };
}

// Registra uma apresentação concluída em `save` (altera o objeto). Retorna os novos recordes.
// `entry` já traz dinheiro e fama calculados. A primeira vez que uma música é tocada conta
// como recorde nos dois quesitos.
export function addPerformance(save, entry) {
    save.history.push(entry);
    if (save.history.length > MAX_HISTORY) save.history.splice(0, save.history.length - MAX_HISTORY);
    save.stats.performances++;

    const record = (save.records[entry.songId] ??= createRecord());
    const first = record.plays === 0;
    record.plays++;

    const newRecords = {
        score: first || entry.score > record.bestScore,
        accuracy: first || entry.accuracy > record.bestAccuracy
    };
    if (newRecords.score) {
        record.bestScore = entry.score;
        record.bestScoreDate = entry.date;
    }
    if (newRecords.accuracy) {
        record.bestAccuracy = entry.accuracy;
        record.bestAccuracyDate = entry.date;
    }
    return newRecords;
}

// Apresentações mais recentes primeiro.
export const recentHistory = (save, limit = 10) => save.history.slice(-limit).reverse();

export const songsPlayed = (save) => Object.values(save.records).filter((record) => record.plays > 0).length;

export const bestOverallScore = (save) =>
    Object.values(save.records).reduce((best, record) => Math.max(best, record.bestScore), 0);
