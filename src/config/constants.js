// Constantes globais do jogo: resolução, fonte, paleta e chaves de cena.

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

// Press Start 2P vem do Google Fonts (index.html). Se estiver offline, o
// navegador cai para a próxima fonte monoespaçada da lista.
export const FONT_NAME = 'Press Start 2P';
export const FONT_FAMILY = `"${FONT_NAME}", "Courier New", Courier, monospace`;

export const SCENE_KEYS = {
    MENU: 'MenuScene',
    CAREER: 'CareerScene',
    GARAGE: 'GarageScene',
    SONG_SELECT: 'SongSelectScene',
    GAME: 'GameScene'
};

// Paleta retrô curta (valores numéricos para formas do Phaser).
export const COLORS = {
    SKY_BANDS: [0x0b0b1e, 0x13102b, 0x1d1540, 0x2b1a54, 0x421e66, 0x5f2275],
    STAGE_DARK: 0x07050f,
    STAGE_EDGE: 0x2a1a4a,
    MAGENTA: 0xff3d9a,
    CYAN: 0x2de2e6,
    YELLOW: 0xffd23f,
    WHITE: 0xf4f1ff,
    GREY: 0x6b6b80,
    // Cores das faixas de notas, no estilo dos jogos de guitarra.
    LANES: [0x35d56a, 0xff4d4d, 0xffd23f, 0x3d8bff, 0xff9a3d]
};

// Minigame de ritmo: teclas e cores das 4 pistas, posição da linha de acerto e
// quanto tempo (ms) uma nota leva do topo da tela até a linha.
export const RHYTHM = {
    LANE_KEYS: ['D', 'F', 'J', 'K'],
    LANE_COLORS: COLORS.LANES.slice(0, 4),
    HIT_Y: 440,
    SPAWN_Y: -30,
    APPROACH_MS: 1700,
    LEAD_IN_BEATS: 4
};

// Cor de cada avaliação (as chaves são os nomes usados em JudgmentSystem).
export const JUDGMENT_COLORS = {
    PERFECT: COLORS.YELLOW,
    GOOD: 0x35d56a,
    MISS: 0xff4d4d
};

// Cor do pulso de luz da pista a cada avaliação.
export const LANE_FEEDBACK_COLORS = {
    PERFECT: COLORS.CYAN,
    GOOD: COLORS.YELLOW,
    MISS: 0xff4d4d
};

// Converte 0xRRGGBB para '#rrggbb' (textos do Phaser usam string CSS).
export const toCss = (hex) => `#${hex.toString(16).padStart(6, '0')}`;

// Ordem de desenho: quanto maior, mais na frente.
export const DEPTH = {
    SKY: 0,
    ROOM: 0,
    STARS: 1,
    SPOTLIGHTS: 2,
    LANES: 3,
    PROPS: 3,
    NOTES: 4,
    STAGE: 5,
    CHARACTER: 5,
    LIGHT: 6,
    UI: 10
};
