import { COLORS, DEPTH, FONT_FAMILY, toCss } from '../config/constants.js';

// Mensagem curta que aparece, sobe um pouco e some (ex.: "EM BREVE!").
// Reaproveita sempre o mesmo texto, então mensagens seguidas não se acumulam.
export default class Toast {
    constructor(scene, { x, y, color = COLORS.YELLOW, fontSize = 12 }) {
        this.scene = scene;
        this.baseY = y;
        this.text = scene.add
            .text(x, y, '', {
                fontFamily: FONT_FAMILY,
                fontSize: `${fontSize}px`,
                color: toCss(color)
            })
            .setOrigin(0.5)
            .setAlpha(0)
            .setDepth(DEPTH.UI);
    }

    show(message) {
        this.tween?.stop();
        this.text.setText(message).setAlpha(1).setY(this.baseY);

        this.tween = this.scene.tweens.add({
            targets: this.text,
            alpha: 0,
            y: this.baseY - 8,
            duration: 400,
            delay: 1400
        });
    }
}
