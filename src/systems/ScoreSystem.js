import { JUDGMENTS } from './JudgmentSystem.js';

// Pontos por avaliação. MISS não pontua e quebra o combo.
export const POINTS = {
    [JUDGMENTS.PERFECT]: 100,
    [JUDGMENTS.GOOD]: 50,
    [JUDGMENTS.MISS]: 0
};

// Pontuação, combo e contagem de acertos de uma partida. Lógica pura (sem Phaser).
export default class ScoreSystem {
    constructor() {
        this.reset();
    }

    reset() {
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.counts = {
            [JUDGMENTS.PERFECT]: 0,
            [JUDGMENTS.GOOD]: 0,
            [JUDGMENTS.MISS]: 0
        };
    }

    register(judgment) {
        this.counts[judgment]++;
        this.score += POINTS[judgment];

        if (judgment === JUDGMENTS.MISS) {
            this.combo = 0;
        } else {
            this.combo++;
            this.maxCombo = Math.max(this.maxCombo, this.combo);
        }
    }

    get totalJudged() {
        return Object.values(this.counts).reduce((sum, count) => sum + count, 0);
    }

    // Precisão de 0 a 100: pontos feitos / pontos possíveis (todas as notas PERFECT).
    get accuracy() {
        const possible = this.totalJudged * POINTS[JUDGMENTS.PERFECT];
        return possible === 0 ? 0 : (this.score / possible) * 100;
    }
}
