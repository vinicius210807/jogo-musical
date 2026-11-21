import { COLORS, DEPTH, FONT_FAMILY, GAME_WIDTH, toCss } from '../config/constants.js';

const BAR = { x: 110, y: 4, width: GAME_WIDTH - 220, height: 10 };
const TEXT_STYLE = { fontFamily: FONT_FAMILY, fontSize: '8px', color: toCss(COLORS.GREY) };

const formatTime = (ms) => {
    const total = Math.max(0, Math.floor(ms / 1000));
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

// Barra de progresso da música no topo da tela, com tempo decorrido e restante (MM:SS).
// Só depende do tempo da música (SongClock) e da duração real dela; nunca de quadros.
export default class ProgressBar {
    constructor(scene, durationMs) {
        this.durationMs = durationMs;
        this.lastSecond = null;

        scene.add
            .rectangle(BAR.x, BAR.y, BAR.width, BAR.height, 0x120c24)
            .setOrigin(0)
            .setStrokeStyle(2, COLORS.STAGE_EDGE)
            .setDepth(DEPTH.UI);
        this.fill = scene.add
            .rectangle(BAR.x, BAR.y, 0, BAR.height, COLORS.CYAN)
            .setOrigin(0)
            .setDepth(DEPTH.UI);

        const textY = BAR.y + BAR.height / 2;
        this.elapsedText = scene.add.text(BAR.x - 10, textY, '00:00', TEXT_STYLE).setOrigin(1, 0.5).setDepth(DEPTH.UI);
        this.remainingText = scene.add.text(BAR.x + BAR.width + 10, textY, '-00:00', TEXT_STYLE).setOrigin(0, 0.5).setDepth(DEPTH.UI);
        this.update(0);
    }

    // `songTimeMs` é negativo durante a contagem: a barra fica parada em 0.
    update(songTimeMs) {
        const elapsed = Math.min(this.durationMs, Math.max(0, songTimeMs));
        this.fill.width = BAR.width * (elapsed / this.durationMs);

        const second = Math.floor(elapsed / 1000);
        if (second === this.lastSecond) return;
        this.lastSecond = second;
        this.elapsedText.setText(formatTime(elapsed));
        this.remainingText.setText(`-${formatTime(Math.ceil((this.durationMs - elapsed) / 1000) * 1000)}`);
    }
}
