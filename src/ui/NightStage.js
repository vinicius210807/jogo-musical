import Phaser from 'phaser';
import { COLORS, DEPTH, GAME_HEIGHT, GAME_WIDTH } from '../config/constants.js';

// Altura da plataforma do palco (usada também pelas notas caindo).
export const STAGE_TOP = 450;

// Céu noturno em faixas (degradê "serrilhado" típico de 8/16 bits) + estrelas piscando.
export function createNightSky(scene) {
    const bands = COLORS.SKY_BANDS;
    const bandHeight = GAME_HEIGHT / bands.length;

    bands.forEach((color, i) => {
        scene.add
            .rectangle(0, i * bandHeight, GAME_WIDTH, bandHeight, color)
            .setOrigin(0)
            .setDepth(DEPTH.SKY);
    });

    for (let i = 0; i < 60; i++) {
        const size = Math.random() < 0.2 ? 4 : 2;
        const star = scene.add
            .rectangle(
                Phaser.Math.Between(0, GAME_WIDTH),
                Phaser.Math.Between(0, 340),
                size,
                size,
                COLORS.WHITE
            )
            .setAlpha(Phaser.Math.FloatBetween(0.4, 0.9))
            .setDepth(DEPTH.STARS);

        scene.tweens.add({
            targets: star,
            alpha: 0.1,
            duration: Phaser.Math.Between(600, 1800),
            delay: Phaser.Math.Between(0, 1500),
            yoyo: true,
            repeat: -1
        });
    }
}

// Três holofotes que balançam de um lado para o outro.
export function createSpotlights(scene) {
    const spots = [
        { x: 300, color: COLORS.CYAN, range: 14, duration: 2600 },
        { x: 480, color: COLORS.MAGENTA, range: 18, duration: 3200 },
        { x: 660, color: COLORS.YELLOW, range: 14, duration: 2900 }
    ];

    spots.forEach((spot, i) => {
        const beam = scene.add.graphics({ x: spot.x, y: -10 });
        beam.fillStyle(spot.color, 0.12);
        beam.fillTriangle(0, 0, -70, STAGE_TOP + 20, 70, STAGE_TOP + 20);
        beam.setBlendMode(Phaser.BlendModes.ADD).setDepth(DEPTH.SPOTLIGHTS);
        beam.angle = -spot.range;

        scene.tweens.add({
            targets: beam,
            angle: spot.range,
            duration: spot.duration,
            delay: i * 300,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    });
}

// Palco em silhueta: plataforma, faixa neon e duas pilhas de amplificadores.
export function createStage(scene) {
    const stageHeight = GAME_HEIGHT - STAGE_TOP;

    scene.add
        .rectangle(0, STAGE_TOP, GAME_WIDTH, stageHeight, COLORS.STAGE_DARK)
        .setOrigin(0)
        .setDepth(DEPTH.STAGE);

    scene.add
        .rectangle(0, STAGE_TOP, GAME_WIDTH, 4, COLORS.MAGENTA)
        .setOrigin(0)
        .setDepth(DEPTH.STAGE);

    [250, 710].forEach((x) => {
        const ampWidth = 64;
        const ampHeight = 96;
        const top = STAGE_TOP - ampHeight;

        scene.add
            .rectangle(x - ampWidth / 2, top, ampWidth, ampHeight, COLORS.STAGE_DARK)
            .setOrigin(0)
            .setStrokeStyle(2, COLORS.STAGE_EDGE)
            .setDepth(DEPTH.STAGE);

        // Dois alto-falantes por amplificador.
        [top + 28, top + 68].forEach((y) => {
            scene.add
                .rectangle(x, y, 32, 24, COLORS.STAGE_EDGE)
                .setDepth(DEPTH.STAGE);
        });

        // Luzinha de "ligado".
        const led = scene.add
            .rectangle(x + 22, top + 8, 4, 4, COLORS.MAGENTA)
            .setDepth(DEPTH.STAGE);
        scene.tweens.add({
            targets: led,
            alpha: 0.2,
            duration: 700,
            yoyo: true,
            repeat: -1
        });
    });
}
