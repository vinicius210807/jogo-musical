// RIFF DA GARAGEM: rock simples e direto, ideal para começar.
export default {
    id: 'riff-da-garagem',
    title: 'RIFF DA GARAGEM',
    style: 'ROCK DE GARAGEM',
    difficulty: 1,
    bpm: 120,
    beatsPerBar: 4,
    audio: {
        drums: 'rock',
        // Nota-raiz do baixo em cada compasso (repete em ciclo).
        bass: { wave: 'square', pattern: 'pulse', roots: ['A2', 'A2', 'F2', 'G2'] }
    },
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
};
