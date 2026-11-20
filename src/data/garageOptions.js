// Opções do menu da garagem. Nesta etapa só a interface existe: nenhuma delas
// executa uma função de verdade (`message` é o aviso mostrado ao selecionar).
export const GARAGE_OPTIONS = [
    {
        id: 'play',
        label: 'TOCAR',
        soon: false,
        description: 'Suba no palco, toque as músicas e ganhe dinheiro e fama.',
        message: 'O MINIGAME CHEGA EM BREVE!'
    },
    {
        id: 'equipment',
        label: 'EQUIPAMENTOS',
        soon: true,
        description: 'Compre e melhore os instrumentos e a aparelhagem da banda.',
        message: 'EM BREVE!'
    },
    {
        id: 'hire',
        label: 'CONTRATAR',
        soon: true,
        description: 'Chame novos integrantes e monte a sua banda.',
        message: 'EM BREVE!'
    },
    {
        id: 'status',
        label: 'STATUS',
        soon: true,
        description: 'Veja as habilidades, o dinheiro e a fama da sua carreira.',
        message: 'EM BREVE!'
    }
];
