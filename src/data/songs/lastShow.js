// LAST SHOW: rock acelerado em mi menor. Bateria forte, baixo "galopante" e um riff
// de guitarra (onda serrilhada com quinta) tocando junto. Progressão: Em - Em - C - D.
export default {
    id: 'last-show',
    title: 'LAST SHOW',
    style: 'ROCK ACELERADO',
    difficulty: 3,
    bpm: 150,
    beatsPerBar: 4,
    audio: {
        drums: 'fast',
        bass: { wave: 'sawtooth', pattern: 'gallop', roots: ['E2', 'E2', 'C3', 'D3'], volume: 0.1 },
        // Riff de guitarra: cada nota soa junto com a quinta acima (power chord).
        lead: {
            wave: 'sawtooth',
            volume: 0.05,
            fifth: true,
            bars: [
                'E4 . E4 . G4 . E4 . A4 . . G4 . E4 . .',
                'E4 . E4 . G4 . E4 . B4 . A4 . G4 . . .',
                'C5 . C5 . B4 . G4 . E4 . G4 . A4 . . .',
                'D5 . D5 . C5 . A4 . B4 . . A4 . G4 . .'
            ]
        }
    },
    bars: [
        '1.2.3.4.1.2.3.4.',
        '4.3.2.1.4.3.2.1.',
        '1.1.2.2.3.3.4.4.',
        '1.2.3.4.4.3.2.1.',
        '12..34..21..43..',
        '1.3.2.4.1.3.2.4.',
        '1.23.41.23.41.2.',
        '4.32.14.32.14.3.',
        '1.1.3.3.2.2.4.4.',
        '1.2.1.2.3.4.3.4.',
        '14..23..14..23..',
        '1.2.3.4.3.2.1.4.',
        '4.3.4.3.2.1.2.1.',
        '1.3.1.3.2.4.2.4.',
        '12..12..34..34..',
        '1.2.3.41.2.34.1.',
        '1.1.2.3.4.4.3.2.',
        '2.3.2.3.1.4.1.4.',
        '1...2.3.4...3.2.',
        '14.23.14.23.14..',
        '1.2.3.4.3.2.1.2.',
        '3.4.3.4.1.2.1.2.',
        '1.3.2.4.4.2.3.1.',
        '1.1.1.2.2.2.3.4.',
        '1.2.3.4.1.2.3.4.',
        '4.3.2.1.4.3.2.1.',
        '1.23.4.1.23.4.1.',
        '1.2.3.4.1.......'
    ]
};
