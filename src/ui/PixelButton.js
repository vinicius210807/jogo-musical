import { COLORS, DEPTH, FONT_FAMILY, toCss } from '../config/constants.js';

const IDLE_FILL = 0x120c24;
const HOVER_FILL = 0x2a1650;

// Botão retrô clicável: caixa com borda colorida e sombra deslocada.
// `press()` também pode ser chamado pelo teclado para dar o mesmo efeito do clique.
export default class PixelButton {
    constructor(
        scene,
        { x, y, width = 240, height = 52, fontSize = 16, label, color = COLORS.YELLOW, onClick }
    ) {
        this.scene = scene;
        this.onClick = onClick;
        this.color = color;
        this.baseY = y;

        this.shadow = scene.add
            .rectangle(x + 4, y + 4, width, height, COLORS.MAGENTA)
            .setDepth(DEPTH.UI);

        this.background = scene.add
            .rectangle(x, y, width, height, IDLE_FILL)
            .setStrokeStyle(3, color)
            .setDepth(DEPTH.UI)
            .setInteractive({ useHandCursor: true });

        this.text = scene.add
            .text(x, y, label, {
                fontFamily: FONT_FAMILY,
                fontSize: `${fontSize}px`,
                color: toCss(COLORS.WHITE)
            })
            .setOrigin(0.5)
            .setDepth(DEPTH.UI);

        this.background.on('pointerover', () => this.setHover(true));
        this.background.on('pointerout', () => this.setHover(false));
        this.background.on('pointerdown', () => this.press());
    }

    setHover(hovered) {
        this.background.setFillStyle(hovered ? HOVER_FILL : IDLE_FILL);
        this.text.setColor(toCss(hovered ? COLORS.YELLOW : COLORS.WHITE));
    }

    // Afunda o botão por um instante e dispara a ação.
    press() {
        this.scene.tweens.add({
            targets: [this.background, this.text],
            y: this.baseY + 3,
            duration: 60,
            yoyo: true
        });
        this.onClick?.();
    }
}
