import { COLORS, DEPTH, FONT_FAMILY, toCss } from '../config/constants.js';
import { characterTextureKey, CHARACTER_SIZE } from './characters.js';

const SPRITE_SCALE = 4;
const PADDING = 16;
const IDLE_FILL = 0x120c24;
const SELECTED_FILL = 0x2a1650;

// Card de uma carreira: personagem à esquerda; nome, instrumento e descrição à direita.
// O card selecionado ganha borda e brilho na cor da carreira, e o personagem "respira".
export default class CareerCard {
    constructor(scene, { x, y, width = 400, height = 150, career, onClick }) {
        this.scene = scene;
        this.career = career;
        this.selected = false;

        const spriteSize = CHARACTER_SIZE * SPRITE_SCALE;
        const left = -width / 2;
        const spriteX = left + PADDING + spriteSize / 2;
        const textX = left + PADDING * 2 + spriteSize;
        const textWidth = width - (textX - left) - PADDING;

        this.glow = scene.add
            .rectangle(0, 0, width + 14, height + 14)
            .setStrokeStyle(4, career.accent, 0.45)
            .setVisible(false);

        this.background = scene.add
            .rectangle(0, 0, width, height, IDLE_FILL)
            .setStrokeStyle(3, COLORS.STAGE_EDGE)
            .setInteractive({ useHandCursor: true });

        const shadow = scene.add.ellipse(spriteX, 58, 96, 12, 0x000000, 0.5);

        this.sprite = scene.add
            .image(spriteX, 0, characterTextureKey(career.id))
            .setScale(SPRITE_SCALE);
        this.spriteBaseY = this.sprite.y;

        this.nameText = scene.add
            .text(textX, -56, career.name, {
                fontFamily: FONT_FAMILY,
                fontSize: '16px',
                color: toCss(COLORS.WHITE)
            })
            .setOrigin(0, 0);

        const instrumentText = scene.add
            .text(textX, -30, career.instrument, {
                fontFamily: FONT_FAMILY,
                fontSize: '12px',
                color: toCss(COLORS.CYAN)
            })
            .setOrigin(0, 0);

        const descriptionText = scene.add
            .text(textX, -6, career.description, {
                fontFamily: FONT_FAMILY,
                fontSize: '10px',
                color: toCss(COLORS.WHITE),
                lineSpacing: 6,
                wordWrap: { width: textWidth }
            })
            .setOrigin(0, 0)
            .setAlpha(0.85);

        this.container = scene.add
            .container(x, y, [
                this.glow,
                this.background,
                shadow,
                this.sprite,
                this.nameText,
                instrumentText,
                descriptionText
            ])
            .setDepth(DEPTH.UI);

        this.background.on('pointerover', () => this.setHover(true));
        this.background.on('pointerout', () => this.setHover(false));
        this.background.on('pointerdown', () => onClick?.(this));

        this.setSelected(false);
    }

    setHover(hovered) {
        if (this.selected) return;
        this.background.setStrokeStyle(3, hovered ? COLORS.GREY : COLORS.STAGE_EDGE);
    }

    setSelected(selected) {
        this.selected = selected;
        const { accent } = this.career;

        this.background.setFillStyle(selected ? SELECTED_FILL : IDLE_FILL);
        this.background.setStrokeStyle(selected ? 4 : 3, selected ? accent : COLORS.STAGE_EDGE);
        this.nameText.setColor(toCss(selected ? COLORS.YELLOW : COLORS.WHITE));
        this.glow.setVisible(selected);

        if (selected) {
            this.sprite.clearTint();
        } else {
            this.sprite.setTint(0x7a7a99);
        }

        this.stopAnimations();
        if (selected) {
            this.glowTween = this.scene.tweens.add({
                targets: this.glow,
                alpha: 0.35,
                duration: 600,
                yoyo: true,
                repeat: -1
            });
            this.bobTween = this.scene.tweens.add({
                targets: this.sprite,
                y: this.spriteBaseY - 4,
                duration: 450,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
        }
    }

    stopAnimations() {
        this.glowTween?.stop();
        this.bobTween?.stop();
        this.glowTween = null;
        this.bobTween = null;
        this.glow.setAlpha(1);
        this.sprite.setY(this.spriteBaseY);
    }
}
