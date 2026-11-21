import { SCENE_KEYS } from '../config/constants.js';

// Opções do menu da garagem. `target` é a cena que a opção abre; sem ele, a opção ainda
// não existe e só mostra o aviso `message` (EQUIPAMENTOS, CONTRATAR e STATUS).
export const GARAGE_OPTIONS = [
    {
        id: 'play',
        label: 'TOCAR',
        soon: false,
        description: 'Suba no palco e toque no ritmo. Acerte as notas para fazer pontos.',
        target: SCENE_KEYS.SONG_SELECT
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
