import {
    COLORS,
    DEPTH,
    FONT_FAMILY,
    GAME_HEIGHT,
    RHYTHM,
    toCss
} from '../config/constants.js';

// "Estrada" do minigame: as quatro pistas, a linha de acerto, os receptores com a tecla
// de cada pista e a barra de progresso da música.
export const HIGHWAY = { x: 300, laneWidth: 90 };
const LANES = RHYTHM.LANE_COLORS.length;
const WIDTH = HIGHWAY.laneWidth * LANES;

export const highwayCenterX = HIGHWAY.x + WIDTH / 2;
export const laneX = (lane) => HIGHWAY.x + HIGHWAY.laneWidth * (lane + 0.5);

const KEY_PLATE_Y = 492;

export default class Highway {
    constructor(scene) {
        this.scene = scene;
        const { HIT_Y, LANE_COLORS, LANE_KEYS } = RHYTHM;

        scene.add
            .rectangle(highwayCenterX, GAME_HEIGHT / 2, WIDTH, GAME_HEIGHT, 0x07050f, 0.82)
            .setDepth(DEPTH.LANES);

        // Faixa colorida de cada pista, e o brilho que acende quando a tecla é apertada.
        this.flashes = LANE_COLORS.map((color, lane) => {
            scene.add
                .rectangle(laneX(lane), GAME_HEIGHT / 2, HIGHWAY.laneWidth, GAME_HEIGHT, color, 0.07)
                .setDepth(DEPTH.LANES);

            return scene.add
                .rectangle(laneX(lane), GAME_HEIGHT / 2, HIGHWAY.laneWidth, GAME_HEIGHT, color, 0)
                .setDepth(DEPTH.LANES);
        });

        // Divisórias e bordas.
        for (let i = 0; i <= LANES; i++) {
            const edge = i === 0 || i === LANES;
            scene.add
                .rectangle(HIGHWAY.x + i * HIGHWAY.laneWidth, GAME_HEIGHT / 2, edge ? 6 : 2, GAME_HEIGHT, edge ? COLORS.MAGENTA : COLORS.WHITE, edge ? 1 : 0.12)
                .setDepth(DEPTH.LANES);
        }

        // Linha de acerto bem destacada: faixa brilhante + linha sólida.
        scene.add
            .rectangle(highwayCenterX, HIT_Y, WIDTH, 22, COLORS.WHITE, 0.14)
            .setDepth(DEPTH.STAGE);
        scene.add
            .rectangle(highwayCenterX, HIT_Y, WIDTH, 4, COLORS.WHITE, 0.95)
            .setDepth(DEPTH.STAGE);

        // Receptores (onde a nota deve estar ao ser apertada) e placas com as teclas.
        this.receptors = LANE_COLORS.map((color, lane) => {
            scene.add
                .rectangle(laneX(lane), HIT_Y, 78, 30)
                .setStrokeStyle(3, color)
                .setDepth(DEPTH.STAGE);

            const fill = scene.add
                .rectangle(laneX(lane), HIT_Y, 78, 30, color, 0)
                .setDepth(DEPTH.STAGE);

            scene.add
                .rectangle(laneX(lane), KEY_PLATE_Y, 72, 36, 0x120c24)
                .setStrokeStyle(3, color)
                .setDepth(DEPTH.STAGE);
            scene.add
                .text(laneX(lane), KEY_PLATE_Y, LANE_KEYS[lane], {
                    fontFamily: FONT_FAMILY,
                    fontSize: '20px',
                    color: toCss(color)
                })
                .setOrigin(0.5)
                .setDepth(DEPTH.STAGE);

            return fill;
        });

        // Barra de progresso no topo da estrada.
        scene.add
            .rectangle(HIGHWAY.x, 0, WIDTH, 6, 0x120c24)
            .setOrigin(0)
            .setDepth(DEPTH.STAGE);
        this.progress = scene.add
            .rectangle(HIGHWAY.x, 0, 0, 6, COLORS.CYAN)
            .setOrigin(0)
            .setDepth(DEPTH.STAGE);
    }

    // Tecla apertada: acende o receptor e a pista.
    press(lane) {
        this.receptors[lane].setFillStyle(RHYTHM.LANE_COLORS[lane], 0.6);

        const flash = this.flashes[lane];
        this.scene.tweens.killTweensOf(flash);
        flash.setAlpha(1).setFillStyle(RHYTHM.LANE_COLORS[lane], 0.3);
        this.scene.tweens.add({ targets: flash, alpha: 0, duration: 180 });
    }

    release(lane) {
        this.receptors[lane].setFillStyle(RHYTHM.LANE_COLORS[lane], 0);
    }

    // Avaliação MISS: a pista pisca em vermelho.
    flashMiss(lane, color) {
        const flash = this.flashes[lane];
        this.scene.tweens.killTweensOf(flash);
        flash.setAlpha(1).setFillStyle(color, 0.35);
        this.scene.tweens.add({ targets: flash, alpha: 0, duration: 260 });
    }

    setProgress(ratio) {
        this.progress.width = WIDTH * Math.min(1, Math.max(0, ratio));
    }
}
