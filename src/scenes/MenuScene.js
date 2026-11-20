import Phaser from 'phaser';
import {
    COLORS,
    DEPTH,
    FONT_FAMILY,
    GAME_HEIGHT,
    GAME_WIDTH,
    SCENE_KEYS,
    toCss
} from '../config/constants.js';
import { createNightSky, createSpotlights, createStage } from '../ui/NightStage.js';
import { createFallingNotes } from '../ui/FallingNotes.js';
import MenuList from '../ui/MenuList.js';

// Tela inicial: título animado, cenário retrô e menu principal.
export default class MenuScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.MENU);
    }

    create() {
        this.transitioning = false;
        this.cameras.main.fadeIn(400, 0, 0, 0);

        createNightSky(this);
        createSpotlights(this);
        createFallingNotes(this);
        createStage(this);

        this.createTitle();
        this.createMenu();
        this.createFooter();
    }

    createTitle() {
        const centerX = GAME_WIDTH / 2;

        const title = this.add
            .text(centerX, 110, 'JOGO MUSICAL', {
                fontFamily: FONT_FAMILY,
                fontSize: '56px',
                color: toCss(COLORS.YELLOW)
            })
            .setOrigin(0.5)
            .setShadow(6, 6, toCss(COLORS.MAGENTA), 0, false, true)
            .setDepth(DEPTH.UI);

        this.tweens.add({
            targets: title,
            y: title.y + 8,
            duration: 1400,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        const subtitle = this.add
            .text(centerX, 180, 'DA GARAGEM AOS PALCOS', {
                fontFamily: FONT_FAMILY,
                fontSize: '16px',
                color: toCss(COLORS.CYAN)
            })
            .setOrigin(0.5)
            .setDepth(DEPTH.UI);

        this.tweens.add({
            targets: subtitle,
            alpha: 0.5,
            duration: 900,
            yoyo: true,
            repeat: -1
        });
    }

    createMenu() {
        this.menu = new MenuList(this, {
            x: GAME_WIDTH / 2,
            y: 270,
            spacing: 52,
            items: [
                { label: 'NOVO JOGO', onSelect: () => this.startNewGame() },
                { label: 'CONTINUAR', enabled: false },
                { label: 'OPÇÕES', enabled: false }
            ]
        });
    }

    createFooter() {
        this.add
            .text(GAME_WIDTH / 2, GAME_HEIGHT - 28, 'SETAS + ENTER OU MOUSE', {
                fontFamily: FONT_FAMILY,
                fontSize: '12px',
                color: toCss(COLORS.GREY)
            })
            .setOrigin(0.5)
            .setDepth(DEPTH.UI);

        this.add
            .text(GAME_WIDTH - 12, GAME_HEIGHT - 10, 'v0.1', {
                fontFamily: FONT_FAMILY,
                fontSize: '8px',
                color: toCss(COLORS.GREY)
            })
            .setOrigin(1)
            .setDepth(DEPTH.UI);
    }

    // Fade para preto e só então troca de cena.
    startNewGame() {
        if (this.transitioning) return;
        this.transitioning = true;
        this.menu.lock();

        const camera = this.cameras.main;
        camera.fadeOut(500, 0, 0, 0);
        camera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start(SCENE_KEYS.GARAGE);
        });
    }
}
