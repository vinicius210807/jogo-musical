// Recompensas de uma apresentação concluída. Lógica pura (sem Phaser).
//
// FÓRMULA
//   multiplicador de dificuldade (D):  fácil 1.0 | médio 1.5 | difícil 2.0
//   fator de precisão (P):             0.5 + precisão/100   (de 0.5 a 1.5)
//
//   DINHEIRO = arredondar( D x (100 + pontuação/100) x P )
//     - 100 é o cachê pela conclusão; pontuação/100 equivale a 1 por nota PERFECT.
//     - a precisão muda o valor total em até +/-50%.
//     - ex.: RIFF DA GARAGEM (111 notas) perfeito = 317 | LAST SHOW perfeito = 981.
//
//   FAMA = arredondar( D x (2 + 8 x A² + 4 x C) )
//     - A = precisão de 0 a 1 (ao quadrado: errar pouco pesa mais que acertar tudo).
//     - C = maior combo / total de notas (de 0 a 1), o "desempenho geral".
//     - ex.: RIFF perfeito = 14 | NEON NIGHTS perfeito = 21 | LAST SHOW perfeito = 28.
//
// Toda apresentação concluída paga pelo menos 1 de fama e o cachê mínimo. Os resultados são
// sempre inteiros e nunca negativos, mesmo com entradas estranhas.

export const DIFFICULTY_MULTIPLIER = { 1: 1, 2: 1.5, 3: 2 };

const toNumber = (value, min, max = Infinity) => {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : min;
};

export function calculateRewards({ score, accuracy, maxCombo, totalNotes, difficulty }) {
    const multiplier = DIFFICULTY_MULTIPLIER[difficulty] ?? 1;
    const safeScore = toNumber(score, 0);
    const accuracyPct = toNumber(accuracy, 0, 100);
    const notes = toNumber(totalNotes, 0);
    const comboRatio = notes === 0 ? 0 : toNumber(maxCombo, 0, notes) / notes;

    const accuracyFactor = 0.5 + accuracyPct / 100;
    const money = Math.round(multiplier * (100 + safeScore / 100) * accuracyFactor);
    const fame = Math.round(multiplier * (2 + 8 * (accuracyPct / 100) ** 2 + 4 * comboRatio));

    return { money: Math.max(0, money), fame: Math.max(1, fame) };
}
