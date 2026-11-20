import { COLORS } from '../config/constants.js';
import { CAREERS } from '../data/careers.js';
import { createPixelTexture } from './pixelArt.js';

// Personagens PROVISÓRIOS em pixel art (32x32), desenhados por código.
// Para trocar por arte original: carregue uma imagem com a mesma chave
// (characterTextureKey) no preload da cena, e remova a função daqui.

export const CHARACTER_SIZE = 32;

const SKIN = 0xf2b98c;
const SKIN_SHADE = 0xd48f66;
const INK = 0x15121f;
const METAL = 0x8a8aa8;
const WOOD = 0x8a5a2b;
const WOOD_DARK = 0x4a2c14;

export const characterTextureKey = (careerId) => `character-${careerId}`;

// Corpo em pé, de frente: cabeça, rosto, tronco e (opcionalmente) pernas.
// Braços e cabelo ficam a cargo de cada personagem.
function drawBase(p, { shirt, shirtShade, pants, shoes, legs = true }) {
    if (legs) {
        p.rect(11, 23, 4, 7, pants);
        p.rect(17, 23, 4, 7, pants);
        p.rect(10, 30, 5, 2, shoes);
        p.rect(17, 30, 5, 2, shoes);
    }

    p.rect(10, 13, 12, 10, shirt);
    p.rect(19, 13, 3, 10, shirtShade);
    p.rect(10, 22, 12, 1, INK);

    p.rect(14, 12, 4, 1, SKIN_SHADE);
    p.rect(12, 4, 8, 8, SKIN);
    p.rect(19, 5, 1, 6, SKIN_SHADE);
    p.rect(11, 7, 1, 2, SKIN);
    p.rect(20, 7, 1, 2, SKIN);
    p.rect(14, 7, 1, 2, INK);
    p.rect(17, 7, 1, 2, INK);
    p.rect(15, 10, 2, 1, 0xa04050);
}

function drawGuitarist(p) {
    const body = 0xe03c3c;
    const bodyShade = 0xa8262d;

    drawBase(p, { shirt: 0x2b2b3a, shirtShade: 0x1d1d2a, pants: 0x2f4fa0, shoes: INK });
    p.rect(14, 15, 4, 3, COLORS.MAGENTA); // estampa da camiseta

    // Cabelo comprido e óculos escuros.
    const hair = 0x2a1a14;
    p.rect(11, 3, 10, 3, hair);
    p.rect(10, 4, 2, 9, hair);
    p.rect(20, 4, 2, 9, hair);
    p.rect(13, 7, 3, 2, INK);
    p.rect(16, 7, 3, 2, INK);
    p.rect(15, 7, 1, 1, INK);

    // Correia, braço e corpo da guitarra.
    p.line(20, 13, 14, 21, INK);
    p.line(11, 20, 2, 11, WOOD, 2);
    p.rect(0, 8, 3, 4, WOOD_DARK);
    p.ellipse(16, 24, 6, 5, body);
    p.ellipse(18, 26, 3, 2, bodyShade);
    p.rect(14, 22, 5, 3, COLORS.WHITE);
    p.rect(14, 21, 5, 1, INK);
    p.rect(14, 27, 5, 1, INK);

    // Mão esquerda no braço da guitarra, direita palhetando.
    p.rect(7, 13, 3, 3, 0x2b2b3a);
    p.rect(5, 14, 3, 2, 0x2b2b3a);
    p.rect(3, 12, 3, 3, SKIN);
    p.rect(22, 13, 3, 5, 0x2b2b3a);
    p.rect(20, 17, 4, 3, 0x2b2b3a);
    p.rect(19, 20, 3, 3, SKIN);
}

function drawSinger(p) {
    const shirt = COLORS.WHITE;
    const shirtShade = 0xb8b0d8;

    drawBase(p, { shirt, shirtShade, pants: 0xc2286f, shoes: COLORS.YELLOW });
    p.rect(15, 16, 2, 2, COLORS.MAGENTA); // estrela da jaqueta

    // Cabelo rosa e boca aberta (cantando).
    const hair = COLORS.MAGENTA;
    p.rect(11, 3, 10, 3, hair);
    p.rect(10, 4, 2, 8, hair);
    p.rect(20, 4, 2, 8, hair);
    p.rect(15, 10, 2, 2, 0x7a2030);

    // Braço esquerdo relaxado.
    p.rect(7, 13, 3, 8, shirt);
    p.rect(7, 21, 3, 2, SKIN);

    // Braço direito levantado segurando o microfone.
    p.rect(24, 5, 2, 5, INK);
    p.ellipse(25, 3, 2, 2, 0xc0c0d0);
    p.rect(25, 2, 1, 1, COLORS.WHITE);
    p.rect(22, 13, 4, 3, shirt);
    p.rect(24, 9, 2, 5, SKIN);
    p.rect(23, 8, 4, 2, SKIN);
}

function drawDrummer(p) {
    const stand = METAL;
    const cymbal = COLORS.YELLOW;

    // Pratos com seus pedestais (atrás do baterista).
    p.rect(4, 14, 1, 16, stand);
    p.ellipse(4, 13, 4, 1, cymbal);
    p.rect(27, 8, 1, 22, stand);
    p.ellipse(27, 7, 4, 1, cymbal);

    drawBase(p, { shirt: COLORS.YELLOW, shirtShade: 0xd9a400, pants: INK, shoes: INK, legs: false });

    // Cabelo laranja espetado.
    const hair = 0xff7a2d;
    p.rect(11, 3, 10, 2, hair);
    p.rect(10, 3, 2, 5, hair);
    p.rect(20, 3, 2, 5, hair);
    p.rect(12, 1, 2, 2, hair);
    p.rect(15, 0, 2, 3, hair);
    p.rect(18, 1, 2, 2, hair);

    // Braços de fora, com baquetas.
    const stick = 0xe8c48a;
    p.rect(7, 13, 3, 4, SKIN);
    p.rect(4, 15, 5, 3, SKIN);
    p.line(4, 16, 2, 13, stick);
    p.rect(22, 13, 3, 4, SKIN);
    p.rect(23, 15, 5, 3, SKIN);
    p.line(27, 16, 29, 9, stick);

    // Tons, bumbo e detalhes.
    p.rect(5, 20, 8, 4, 0x3d8bff);
    p.ellipse(9, 20, 4, 1, COLORS.WHITE);
    p.rect(19, 20, 8, 4, 0x3d8bff);
    p.ellipse(23, 20, 4, 1, COLORS.WHITE);
    p.ellipse(16, 26, 7, 5, COLORS.WHITE);
    p.ellipse(16, 26, 6, 4, 0xd9363e);
    p.rect(15, 25, 2, 2, COLORS.WHITE);
    p.rect(11, 30, 2, 2, METAL);
    p.rect(19, 30, 2, 2, METAL);
}

function drawBassist(p) {
    const shirt = 0x7b3fe4;
    const shirtShade = 0x5a2bb0;
    const body = 0x2d6cdf;

    drawBase(p, { shirt, shirtShade, pants: 0x2a2a3a, shoes: COLORS.WHITE });
    p.rect(13, 15, 6, 1, COLORS.WHITE); // listras da camiseta
    p.rect(13, 18, 6, 1, COLORS.WHITE);

    // Boné ciano e barba.
    const cap = COLORS.CYAN;
    p.rect(11, 2, 10, 4, cap);
    p.rect(10, 5, 12, 1, 0x1b9aa0);
    p.rect(11, 6, 1, 3, 0x3a2a20);
    p.rect(20, 6, 1, 3, 0x3a2a20);
    p.rect(13, 10, 6, 2, 0x3a2a20);

    // Correia, braço longo do baixo apontando para cima à direita, e corpo.
    p.line(11, 13, 15, 21, INK);
    p.line(19, 21, 30, 12, WOOD, 2);
    p.rect(29, 8, 3, 5, WOOD_DARK);
    p.ellipse(15, 24, 5, 4, body);
    p.rect(13, 23, 4, 3, COLORS.WHITE);
    p.rect(13, 22, 4, 1, INK);

    // Mão direita no braço do baixo, esquerda dedilhando.
    p.rect(22, 13, 3, 4, shirt);
    p.rect(23, 16, 3, 3, SKIN);
    p.rect(7, 13, 3, 6, shirt);
    p.rect(8, 18, 4, 3, shirt);
    p.rect(11, 21, 3, 3, SKIN);
}

const DRAWERS = {
    guitarist: drawGuitarist,
    singer: drawSinger,
    drummer: drawDrummer,
    bassist: drawBassist
};

// Gera as texturas dos quatro personagens (só na primeira vez).
export function ensureCharacterTextures(scene) {
    CAREERS.forEach(({ id }) => {
        createPixelTexture(scene, characterTextureKey(id), CHARACTER_SIZE, CHARACTER_SIZE, DRAWERS[id]);
    });
}
