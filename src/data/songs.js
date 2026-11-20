// Músicas do minigame. Dados puros (sem Phaser): a cena e os testes só consomem `buildChart`.
//
// Cada compasso de `bars` é uma string de 16 passos (semicolcheias), um por posição:
//   '.'  = sem nota   |   '1' a '4' = nota na pista correspondente (D, F, J, K).
// Os tempos das notas saem do BPM, então mudar o andamento não exige mexer nas notas.
//
// `audioKey` / `audioUrl` (opcionais): faixa de áudio real. Sem elas o jogo usa a trilha
// sintetizada de SongAudio (bateria + baixo gerados por código, sem direitos autorais).

export const STEPS_PER_BAR = 16;

export const SONGS = [
    {
        id: 'riff-da-garagem',
        title: 'RIFF DA GARAGEM',
        bpm: 120,
        beatsPerBar: 4,
        // Nota-raiz do baixo em cada compasso (repete em ciclo).
        bassRoots: ['A2', 'A2', 'F2', 'G2'],
        bars: [
            '1...2...3...4...',
            '4...3...2...1...',
            '1.1.2.2.3.3.4.4.',
            '4.4.3.3.2.2.1.1.',
            '1..2..3..4..2.3.',
            '4..3..2..1..3.2.',
            '1.2.3.4.4.3.2.1.',
            '1.3.2.4.1.3.2.4.',
            '1.1.2.3.4.4.3.2.',
            '1.2.3.4.3.2.1.2.',
            '1...3...2...4...',
            '2.3.2.3.1.4.1.4.',
            '1.2.3.4.1.2.3.4.',
            '4.3.2.1.4.3.2.1.',
            '1.23.4.1.23.4.1.',
            '1.2.3.4.1...4...'
        ]
    }
];

export const DEFAULT_SONG = SONGS[0];

export const beatDurationMs = (song) => 60000 / song.bpm;

export const songDurationMs = (song) => song.bars.length * song.beatsPerBar * beatDurationMs(song);

// Converte os compassos em uma lista de notas { id, lane, time }, em ordem de tempo.
// `time` é em ms desde o início da música (0 = primeiro tempo do primeiro compasso).
export function buildChart(song) {
    const stepMs = beatDurationMs(song) / (STEPS_PER_BAR / song.beatsPerBar);
    const notes = [];

    song.bars.forEach((bar, barIndex) => {
        if (bar.length !== STEPS_PER_BAR) {
            throw new Error(`Compasso ${barIndex + 1} de "${song.id}" deve ter ${STEPS_PER_BAR} passos.`);
        }

        [...bar].forEach((char, step) => {
            if (char === '.') return;

            const lane = Number(char) - 1;
            if (!Number.isInteger(lane) || lane < 0 || lane > 3) {
                throw new Error(`Caractere inválido "${char}" no compasso ${barIndex + 1}.`);
            }

            const time = (barIndex * STEPS_PER_BAR + step) * stepMs;
            notes.push({ id: notes.length, lane, time });
        });
    });

    return notes;
}
