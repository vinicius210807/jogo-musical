import { COLORS, DEPTH, FONT_FAMILY, JUDGMENT_COLORS, toCss } from '../config/constants.js';
import { characterTextureKey } from './characters.js';

const LEFT = { x: 16, y: 20, width: 268, height: 336 };
const RIGHT = { x: 676, y: 20, width: 268, height: 176 };
const LABEL_STYLE = { fontFamily: FONT_FAMILY, fontSize: '10px', color: toCss(COLORS.GREY) };

function drawPanel(scene, { x, y, width, height }) {
    scene.add
        .rectangle(x, y, width, height, 0x0b0714, 0.88)
        .setOrigin(0)
        .setStrokeStyle(3, COLORS.STAGE_EDGE)
        .setDepth(DEPTH.UI);
}

function addText(scene, x, y, text, { size = 16, color = COLORS.WHITE, origin = [0, 0] } = {}) {
    return scene.add
        .text(x, y, text, {
            fontFamily: FONT_FAMILY,
            fontSize: `${size}px`,
            color: toCss(color)
        })
        .setOrigin(...origin)
        .setDepth(DEPTH.UI);
}

// Interface do minigame: pontuação e combos à esquerda, contagem de acertos e o músico
// da carreira escolhida à direita. Só mostra números; quem calcula é o ScoreSystem.
export default class RhythmHud {
    constructor(scene, { song, career }) {
        this.scene = scene;
        this.createLeftPanel(song);
        this.createRightPanel(career);
    }

    createLeftPanel(song) {
        drawPanel(this.scene, LEFT);
        const x = LEFT.x + 20;

        addText(this.scene, LEFT.x + LEFT.width / 2, 44, song.title, { size: 12, color: COLORS.CYAN, origin: [0.5, 0.5] });
        addText(this.scene, LEFT.x + LEFT.width / 2, 64, `${song.bpm} BPM`, { size: 10, color: COLORS.GREY, origin: [0.5, 0.5] });
        this.scene.add
            .rectangle(LEFT.x + 20, 82, LEFT.width - 40, 2, COLORS.STAGE_EDGE)
            .setOrigin(0)
            .setDepth(DEPTH.UI);

        this.scene.add.text(x, 100, 'PONTUAÇÃO', LABEL_STYLE).setDepth(DEPTH.UI);
        this.scoreText = addText(this.scene, x, 120, '0', { size: 28 });

        this.scene.add.text(x, 180, 'COMBO', LABEL_STYLE).setDepth(DEPTH.UI);
        this.comboText = addText(this.scene, x, 200, '0', { size: 48, color: COLORS.YELLOW });

        this.scene.add.text(x, 280, 'MAIOR COMBO', LABEL_STYLE).setDepth(DEPTH.UI);
        this.maxComboText = addText(this.scene, x, 300, '0', { size: 24 });
    }

    createRightPanel(career) {
        drawPanel(this.scene, RIGHT);
        const left = RIGHT.x + 20;
        const right = RIGHT.x + RIGHT.width - 20;

        this.scene.add.text(left, 40, 'ACERTOS', LABEL_STYLE).setDepth(DEPTH.UI);

        this.countTexts = {};
        ['PERFECT', 'GOOD', 'MISS'].forEach((judgment, i) => {
            const y = 72 + i * 40;
            addText(this.scene, left, y, judgment, { color: JUDGMENT_COLORS[judgment] });
            this.countTexts[judgment] = addText(this.scene, right, y, '0', { origin: [1, 0] });
        });

        // Músico da carreira escolhida, que pula no ritmo (a cada tempo da música).
        if (!career) return;

        const centerX = RIGHT.x + RIGHT.width / 2;
        this.spriteBaseY = 492;
        this.sprite = this.scene.add
            .image(centerX, this.spriteBaseY, characterTextureKey(career.id))
            .setOrigin(0.5, 1)
            .setScale(5)
            .setDepth(DEPTH.UI);
        addText(this.scene, centerX, 508, career.name, { size: 10, color: COLORS.YELLOW, origin: [0.5, 0] });
    }

    update(score) {
        this.scoreText.setText(String(score.score));
        this.comboText.setText(String(score.combo));
        this.maxComboText.setText(String(score.maxCombo));
        Object.entries(this.countTexts).forEach(([judgment, text]) => {
            text.setText(String(score.counts[judgment]));
        });
    }

    // Combo aumentou: "estalo" no número. Combo quebrou: ele fica vermelho por um instante.
    pulseCombo(broken) {
        this.scene.tweens.killTweensOf(this.comboText);
        this.comboText.setScale(broken ? 1 : 1.25);
        this.comboText.setColor(toCss(broken ? JUDGMENT_COLORS.MISS : COLORS.YELLOW));
        this.scene.tweens.add({ targets: this.comboText, scale: 1, duration: 140 });
    }

    hop() {
        if (!this.sprite) return;
        this.scene.tweens.killTweensOf(this.sprite);
        this.sprite.setY(this.spriteBaseY);
        this.scene.tweens.add({
            targets: this.sprite,
            y: this.spriteBaseY - 10,
            duration: 90,
            yoyo: true
        });
    }
}
