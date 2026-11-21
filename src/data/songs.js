// Músicas do minigame. Dados puros (sem Phaser): a cena e os testes só consomem `buildChart`.
//
// Cada música fica em seu próprio arquivo em `songs/` (metadados, chart e arranjo sintetizado)
// e é registrada na lista SONGS abaixo. Para adicionar uma faixa, crie o arquivo e inclua-o ali:
// a cena do minigame, a seleção de músicas e os resultados não precisam mudar.
//
// Cada compasso de `bars` é uma string de 16 passos (semicolcheias), um por posição:
//   '.'  = sem nota   |   '1' a '4' = nota na pista correspondente (D, F, J, K).
// Os tempos das notas saem do BPM, então mudar o andamento não exige mexer nas notas.
//
// `audioKey` / `audioUrl` (opcionais): faixa de áudio real. Sem elas o jogo usa a trilha
// sintetizada de SongAudio (bateria + baixo gerados por código, sem direitos autorais).
import lastShow from './songs/lastShow.js';
import neonNights from './songs/neonNights.js';
import riffDaGaragem from './songs/riffDaGaragem.js';

export const STEPS_PER_BAR = 16;

export const SONGS = [riffDaGaragem, neonNights, lastShow];

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

export const DIFFICULTY_LABELS = { 1: 'FÁCIL', 2: 'MÉDIO', 3: 'DIFÍCIL' };

export const getSongById = (id) => SONGS.find((song) => song.id === id);

// mm:ss de uma duração em ms.
export function formatDuration(ms) {
    const total = Math.round(ms / 1000);
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}
