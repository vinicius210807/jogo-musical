import Phaser from 'phaser';
import {
    COLORS,
    DEPTH,
    FONT_FAMILY,
    GAME_WIDTH,
    SCENE_KEYS,
    toCss
} from '../config/constants.js';
import { getCareer } from '../systems/CareerSystem.js';
import { createNightSky } from '../ui/NightStage.js';
import { characterTextureKey, ensureCharacterTextures } from '../ui/characters.js';
import MenuList from '../ui/MenuList.js';
import { fadeToScene } from '../ui/transitions.js';

// Tela PROVISÓRIA: mostra a carreira escolhida (prova de que o dado foi preservado)
// e permite voltar ao menu. A garagem de verdade (equipamentos, banda) virá depois.
export default class GarageScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.GARAGE);
    }

    create() {
        this.transitioning = false;
        this.cameras.main.fadeIn(400, 0, 0, 0);

        createNightSky(this);
        ensureCharacterTextures(this);

        const centerX = GAME_WIDTH / 2;

        this.add
            .text(centerX, 70, 'GARAGEM', {
                fontFamily: FONT_FAMILY,
                fontSize: '48px',
                color: toCss(COLORS.YELLOW)
            })
            .setOrigin(0.5)
            .setShadow(5, 5, toCss(COLORS.MAGENTA), 0, false, true)
            .setDepth(DEPTH.UI);

        this.createCareerInfo(centerX);

        const notice = this.add
            .text(centerX, 385, 'EM CONSTRUÇÃO', {
                fontFamily: FONT_FAMILY,
                fontSize: '20px',
                color: toCss(COLORS.CYAN)
            })
            .setOrigin(0.5)
            .setDepth(DEPTH.UI);

        this.tweens.add({
            targets: notice,
            alpha: 0.2,
            duration: 600,
            yoyo: true,
            repeat: -1
        });

        this.menu = new MenuList(this, {
            x: centerX,
            y: 460,
            items: [{ label: 'VOLTAR', onSelect: () => this.backToMenu() }]
        });

        this.input.keyboard.on('keydown-ESC', () => this.backToMenu());
    }

    // Personagem e nome da carreira escolhida na CareerScene.
    createCareerInfo(centerX) {
        const career = getCareer(this);

        if (career) {
            this.add
                .image(centerX, 200, characterTextureKey(career.id))
                .setScale(4)
                .setDepth(DEPTH.UI);
        }

        this.add
            .text(centerX, 310, `CARREIRA: ${career ? career.name : 'NENHUMA'}`, {
                fontFamily: FONT_FAMILY,
                fontSize: '24px',
                color: toCss(COLORS.WHITE)
            })
            .setOrigin(0.5)
            .setDepth(DEPTH.UI);

        if (career) {
            this.add
                .text(centerX, 346, career.instrument, {
                    fontFamily: FONT_FAMILY,
                    fontSize: '12px',
                    color: toCss(career.accent)
                })
                .setOrigin(0.5)
                .setDepth(DEPTH.UI);
        }
    }

    backToMenu() {
        if (fadeToScene(this, SCENE_KEYS.MENU, 400)) this.menu.lock();
    }
}
