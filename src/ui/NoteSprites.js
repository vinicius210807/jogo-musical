import { RHYTHM } from '../config/constants.js';
import { createPixelTexture, mixColors } from './pixelArt.js';

// Notas do minigame em pixel art: uma textura 14x5 por pista, ampliada 5x (70x25 px).
export const NOTE_SCALE = 5;
export const NOTE_WIDTH = 14 * NOTE_SCALE;

export const noteTextureKey = (lane) => `note-lane-${lane}`;

export function ensureNoteTextures(scene) {
    RHYTHM.LANE_COLORS.forEach((color, lane) => {
        createPixelTexture(scene, noteTextureKey(lane), 14, 5, (p) => {
            const outline = mixColors(color, 0x000000, 0.65);
            const light = mixColors(color, 0xffffff, 0.6);
            const shade = mixColors(color, 0x000000, 0.3);

            p.rect(0, 0, 14, 5, outline);
            p.rect(1, 1, 12, 3, color);
            p.rect(1, 1, 12, 1, light);
            p.rect(1, 3, 12, 1, shade);
            p.rect(5, 2, 4, 1, light);
        });
    });
}
