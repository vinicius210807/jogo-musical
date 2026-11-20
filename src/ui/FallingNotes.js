import Phaser from 'phaser';
import { COLORS, DEPTH, GAME_WIDTH } from '../config/constants.js';

const LANE_SPACING = 40;
const NOTE_WIDTH = 28;
const NOTE_HEIGHT = 14;
const HIT_Y = 430;
const FALL_DURATION = 3200;
const SPAWN_INTERVAL = 380;

// Notas coloridas caindo em duas pilhas de faixas (esquerda e direita da tela),
// como um aperitivo visual do ritmo que virá nas próximas telas.
export function createFallingNotes(scene) {
    const margin = 48;
    const groupWidth = (COLORS.LANES.length - 1) * LANE_SPACING;
    const groupStarts = [margin, GAME_WIDTH - margin - groupWidth];

    const lanes = [];
    groupStarts.forEach((startX) => {
        COLORS.LANES.forEach((color, i) => {
            const x = startX + i * LANE_SPACING;

            scene.add
                .rectangle(x, 0, 4, HIT_Y, color, 0.12)
                .setOrigin(0.5, 0)
                .setDepth(DEPTH.LANES);

            const target = scene.add
                .rectangle(x, HIT_Y, NOTE_WIDTH + 8, NOTE_HEIGHT + 8)
                .setStrokeStyle(2, color, 0.6)
                .setDepth(DEPTH.LANES);

            lanes.push({ x, color, target });
        });
    });

    // `progress` (0 a 1) permite criar notas já no meio da queda ao abrir a cena.
    const spawnNote = (progress = 0) => {
        const lane = Phaser.Utils.Array.GetRandom(lanes);
        const startY = -20 + progress * (HIT_Y + 20);

        const note = scene.add
            .rectangle(lane.x, startY, NOTE_WIDTH, NOTE_HEIGHT, lane.color)
            .setStrokeStyle(2, COLORS.WHITE, 0.8)
            .setDepth(DEPTH.NOTES);

        scene.tweens.add({
            targets: note,
            y: HIT_Y,
            duration: FALL_DURATION * (1 - progress),
            ease: 'Linear',
            onComplete: () => {
                note.destroy();
                scene.tweens.add({
                    targets: lane.target,
                    scale: 1.4,
                    duration: 90,
                    yoyo: true
                });
            }
        });
    };

    for (let i = 0; i < 8; i++) {
        spawnNote(Phaser.Math.FloatBetween(0.05, 0.9));
    }

    scene.time.addEvent({
        delay: SPAWN_INTERVAL,
        loop: true,
        callback: () => {
            if (Math.random() < 0.8) spawnNote();
        }
    });
}
