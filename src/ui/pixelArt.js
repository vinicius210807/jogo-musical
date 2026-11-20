import { toCss } from '../config/constants.js';

// Pequeno "pincel" para desenhar pixel art por código num canvas 1 pixel = 1 unidade.
// O Phaser amplia a textura com `pixelArt: true`, então os pixels ficam nítidos.
function createPainter(ctx) {
    const rect = (x, y, width, height, color) => {
        ctx.fillStyle = toCss(color);
        ctx.fillRect(x, y, width, height);
    };

    // Elipse preenchida, linha a linha (fica "serrilhada", como pixel art pede).
    const ellipse = (cx, cy, rx, ry, color) => {
        for (let dy = -ry; dy <= ry; dy++) {
            const half = ry === 0 ? rx : Math.round(rx * Math.sqrt(1 - (dy * dy) / (ry * ry)));
            rect(cx - half, cy + dy, half * 2 + 1, 1, color);
        }
    };

    // Linha com espessura `size` (algoritmo de Bresenham).
    const line = (x0, y0, x1, y1, color, size = 1) => {
        const dx = Math.abs(x1 - x0);
        const dy = -Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx + dy;
        let x = x0;
        let y = y0;

        for (;;) {
            rect(x, y, size, size, color);
            if (x === x1 && y === y1) break;
            const e2 = 2 * err;
            if (e2 >= dy) {
                err += dy;
                x += sx;
            }
            if (e2 <= dx) {
                err += dx;
                y += sy;
            }
        }
    };

    return { rect, ellipse, line };
}

// Mistura duas cores 0xRRGGBB: t = 0 devolve `a`, t = 1 devolve `b`.
export function mixColors(a, b, t) {
    const channel = (shift) => {
        const from = (a >> shift) & 0xff;
        const to = (b >> shift) & 0xff;
        return Math.round(from + (to - from) * t);
    };
    return (channel(16) << 16) | (channel(8) << 8) | channel(0);
}

// Cria (uma única vez) uma textura de canvas desenhada pela função `draw(painter)`.
export function createPixelTexture(scene, key, width, height, draw) {
    if (scene.textures.exists(key)) return;

    const texture = scene.textures.createCanvas(key, width, height);
    draw(createPainter(texture.getContext()));
    texture.refresh();
}
