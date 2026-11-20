import { COLORS, DEPTH, FONT_FAMILY, GAME_WIDTH, toCss } from '../config/constants.js';
import { ICON_COIN, ICON_STAR, ensureIconTextures } from './icons.js';
import PixelButton from './PixelButton.js';

const BAR_HEIGHT = 40;

// Barra superior da garagem: botão MENU, título da tela e os contadores de
// dinheiro e fama do jogador.
export default class PlayerHud {
    constructor(scene, { title, money, fame, onBack }) {
        ensureIconTextures(scene);

        scene.add
            .rectangle(0, 0, GAME_WIDTH, BAR_HEIGHT, 0x0b0714, 0.92)
            .setOrigin(0)
            .setDepth(DEPTH.UI);
        scene.add
            .rectangle(0, BAR_HEIGHT, GAME_WIDTH, 2, COLORS.MAGENTA)
            .setOrigin(0)
            .setDepth(DEPTH.UI);

        new PixelButton(scene, {
            x: 86,
            y: BAR_HEIGHT / 2,
            width: 140,
            height: 28,
            fontSize: 12,
            label: '< MENU',
            color: COLORS.CYAN,
            onClick: onBack
        });

        scene.add
            .text(GAME_WIDTH / 2 - 60, BAR_HEIGHT / 2, title, {
                fontFamily: FONT_FAMILY,
                fontSize: '16px',
                color: toCss(COLORS.YELLOW)
            })
            .setOrigin(0.5)
            .setDepth(DEPTH.UI);

        this.moneyText = this.createStat(scene, 640, ICON_COIN, 'DINHEIRO', this.formatMoney(money));
        this.fameText = this.createStat(scene, 810, ICON_STAR, 'FAMA', String(fame));
    }

    // Ícone à esquerda; rótulo pequeno em cima e valor embaixo.
    createStat(scene, x, icon, label, value) {
        scene.add
            .image(x + 12, BAR_HEIGHT / 2, icon)
            .setScale(2)
            .setDepth(DEPTH.UI);

        scene.add
            .text(x + 34, 5, label, {
                fontFamily: FONT_FAMILY,
                fontSize: '8px',
                color: toCss(COLORS.GREY)
            })
            .setDepth(DEPTH.UI);

        return scene.add
            .text(x + 34, 18, value, {
                fontFamily: FONT_FAMILY,
                fontSize: '16px',
                color: toCss(COLORS.WHITE)
            })
            .setDepth(DEPTH.UI);
    }

    formatMoney(money) {
        return `R$ ${money}`;
    }

    setMoney(money) {
        this.moneyText.setText(this.formatMoney(money));
    }

    setFame(fame) {
        this.fameText.setText(String(fame));
    }
}
