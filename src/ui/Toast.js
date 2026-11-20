import { COLORS, DEPTH, FONT_FAMILY, toCss } from '../config/constants.js';

// Mensagem curta que aparece, sobe um pouco e some (ex.: "EM BREVE!" ou "PERFECT!").
// Reaproveita sempre o mesmo texto, então mensagens seguidas não se acumulam.
//
// Opções: holdMs (quanto tempo fica inteira), fadeMs (duração do sumiço), rise (quanto
// sobe ao sumir) e pop (começa maior e encolhe, para dar um "estalo").
export default class Toast {
    constructor(
        scene,
        { x, y, color = COLORS.YELLOW, fontSize = 12, holdMs = 1400, fadeMs = 400, rise = 8, pop = false }
    ) {
        this.scene = scene;
        this.baseY = y;
        this.defaultColor = color;
        this.holdMs = holdMs;
        this.fadeMs = fadeMs;
        this.rise = rise;
        this.pop = pop;

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

    // `color` é opcional; sem ele volta à cor padrão.
    show(message, color = this.defaultColor) {
        this.scene.tweens.killTweensOf(this.text);
        this.text
            .setText(message)
            .setColor(toCss(color))
            .setAlpha(1)
            .setY(this.baseY)
            .setScale(this.pop ? 1.5 : 1);

        if (this.pop) {
            this.scene.tweens.add({ targets: this.text, scale: 1, duration: 90, ease: 'Back.easeOut' });
        }

        this.scene.tweens.add({
            targets: this.text,
            alpha: 0,
            y: this.baseY - this.rise,
            duration: this.fadeMs,
            delay: this.holdMs
        });
    }
}
