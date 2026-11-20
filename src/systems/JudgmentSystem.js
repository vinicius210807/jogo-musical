// Julgamento das notas. Lógica pura (sem Phaser): trabalha só com tempos em ms
// medidos no relógio da música, nunca com frames.

export const JUDGMENTS = {
    PERFECT: 'PERFECT',
    GOOD: 'GOOD',
    MISS: 'MISS'
};

// Erro máximo (ms, em módulo) de cada avaliação.
export const HIT_WINDOWS_MS = {
    PERFECT: 70,
    GOOD: 130
};

// Apertar a tecla até 200 ms antes da nota conta como tentativa (e vira MISS se o erro
// passar de 130 ms). Mais cedo que isso, o toque é ignorado, para não punir toques soltos.
export const EARLY_PRESS_WINDOW_MS = 200;

// Avaliação para um erro (tempo do toque - tempo da nota), em ms.
export function judgeError(errorMs) {
    const error = Math.abs(errorMs);
    if (error <= HIT_WINDOWS_MS.PERFECT) return JUDGMENTS.PERFECT;
    if (error <= HIT_WINDOWS_MS.GOOD) return JUDGMENTS.GOOD;
    return JUDGMENTS.MISS;
}

// Acompanha quais notas já foram julgadas e decide o que cada toque acerta.
// Cada pista é uma fila: um toque só pode atingir a nota mais antiga ainda sem julgamento.
export default class NoteJudge {
    constructor(chart, laneCount = 4) {
        this.notes = chart.map((note) => ({ ...note, judgment: null }));
        this.lanes = Array.from({ length: laneCount }, () => []);
        this.notes.forEach((note) => this.lanes[note.lane].push(note));
        this.cursors = new Array(laneCount).fill(0);
        this.pending = this.notes.length;
    }

    nextNote(lane) {
        return this.lanes[lane][this.cursors[lane]] ?? null;
    }

    resolve(lane, judgment) {
        const note = this.nextNote(lane);
        note.judgment = judgment;
        this.cursors[lane]++;
        this.pending--;
        return note;
    }

    // Toque na pista `lane` no instante `songTime`. Retorna { note, judgment, error }
    // ou null se não houver nota por perto (toque ignorado).
    press(lane, songTime) {
        const note = this.nextNote(lane);
        if (!note) return null;

        const error = songTime - note.time;
        if (Math.abs(error) > EARLY_PRESS_WINDOW_MS) return null;

        const judgment = judgeError(error);
        this.resolve(lane, judgment);
        return { note, judgment, error };
    }

    // Marca como MISS as notas que passaram da janela de acerto sem toque.
    // Retorna a lista de resultados, no mesmo formato de press().
    expire(songTime) {
        const missed = [];

        this.lanes.forEach((_, lane) => {
            for (let note = this.nextNote(lane); note; note = this.nextNote(lane)) {
                const error = songTime - note.time;
                if (error <= HIT_WINDOWS_MS.GOOD) break;

                this.resolve(lane, JUDGMENTS.MISS);
                missed.push({ note, judgment: JUDGMENTS.MISS, error });
            }
        });

        return missed;
    }

    get finished() {
        return this.pending === 0;
    }
}
