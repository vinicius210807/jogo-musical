import { COLORS } from '../config/constants.js';

// Carreiras jogáveis. `id` também identifica o personagem em src/ui/characters.js.
export const CAREERS = [
    {
        id: 'guitarist',
        name: 'GUITARRISTA',
        instrument: 'Guitarra elétrica',
        description: 'Riffs pesados e solos que incendeiam o palco.',
        accent: 0xff4d4d
    },
    {
        id: 'singer',
        name: 'CANTOR',
        instrument: 'Voz e microfone',
        description: 'A voz da banda. Carisma para conquistar o público.',
        accent: COLORS.MAGENTA
    },
    {
        id: 'drummer',
        name: 'BATERISTA',
        instrument: 'Bateria',
        description: 'O coração do ritmo. Mantém todo mundo no compasso.',
        accent: COLORS.YELLOW
    },
    {
        id: 'bassist',
        name: 'BAIXISTA',
        instrument: 'Baixo elétrico',
        description: 'Grooves graves que sustentam toda a música.',
        accent: 0x3d8bff
    }
];

export const getCareerById = (id) => CAREERS.find((career) => career.id === id);
