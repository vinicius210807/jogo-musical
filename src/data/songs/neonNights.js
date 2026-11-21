// NEON NIGHTS: synthwave em lá menor. Notas espaçadas, baixo serrilhado, acordes longos
// ao fundo e uma melodia de sintetizador por cima. Progressão: Am - F - C - G.
export default {
    id: 'neon-nights',
    title: 'NEON NIGHTS',
    style: 'SYNTHWAVE',
    difficulty: 2,
    bpm: 100,
    beatsPerBar: 4,
    audio: {
        drums: 'synthwave',
        bass: { wave: 'sawtooth', pattern: 'eighths', roots: ['A2', 'F2', 'C3', 'G2'], volume: 0.09 },
        // Um acorde por compasso (repete em ciclo de 4 compassos).
        pad: {
            wave: 'triangle',
            volume: 0.05,
            chords: [
                ['A3', 'C4', 'E4'],
                ['F3', 'A3', 'C4'],
                ['C4', 'E4', 'G4'],
                ['G3', 'B3', 'D4']
            ]
        },
        // Melodia: 16 passos por compasso, '.' = silêncio (repete em ciclo de 4 compassos).
        lead: {
            wave: 'square',
            volume: 0.055,
            bars: [
                'E5 . . . . . D5 . C5 . . . . . . .',
                'C5 . . . A4 . . . C5 . . . D5 . . .',
                'E5 . . . G5 . . . E5 . . . . . D5 .',
                'D5 . . . B4 . . . G4 . . . . . . .'
            ]
        }
    },
    bars: [
        '1.......3.......',
        '2.......4.......',
        '1.......2...3...',
        '4.......3...2...',
        '1...2...3...4...',
        '4...3...2...1...',
        '1.....2.3.....4.',
        '2...3.......1...',
        '1...3...2...4...',
        '3.......1...2.4.',
        '1.2.....3.4.....',
        '4...2...3...1...',
        '1.......2.3.....',
        '4.......3.2.....',
        '1...2...1...3...',
        '4...3...4...2...',
        '1.2.3.4.........',
        '4.3.2.1.........',
        '2...4...1...3...',
        '1.......4.......'
    ]
};
