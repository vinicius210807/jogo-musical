import { COLORS } from '../config/constants.js';
import { createPixelTexture } from './pixelArt.js';

// Ícones 12x12 da interface, desenhados por código.
export const ICON_SIZE = 12;
export const ICON_COIN = 'icon-coin';
export const ICON_STAR = 'icon-star';

const GOLD_DARK = 0xb8860b;

// Linhas do desenho da estrela: [y, x, largura].
const STAR_ROWS = [
    [0, 5, 2],
    [1, 5, 2],
    [2, 4, 4],
    [3, 0, 12],
    [4, 1, 10],
    [5, 2, 8],
    [6, 3, 6],
    [7, 2, 8],
    [8, 2, 3],
    [8, 7, 3],
    [9, 1, 3],
    [9, 8, 3]
];

export function ensureIconTextures(scene) {
    createPixelTexture(scene, ICON_COIN, ICON_SIZE, ICON_SIZE, (p) => {
        p.ellipse(6, 6, 5, 5, GOLD_DARK);
        p.ellipse(6, 6, 4, 4, COLORS.YELLOW);
        p.rect(5, 3, 2, 6, GOLD_DARK);
        p.rect(4, 4, 4, 1, GOLD_DARK);
        p.rect(4, 7, 4, 1, GOLD_DARK);
        p.rect(3, 3, 1, 2, COLORS.WHITE);
    });

    createPixelTexture(scene, ICON_STAR, ICON_SIZE, ICON_SIZE, (p) => {
        STAR_ROWS.forEach(([y, x, width]) => p.rect(x, y, width, 1, COLORS.MAGENTA));
        p.rect(5, 4, 2, 3, COLORS.WHITE);
    });
}
