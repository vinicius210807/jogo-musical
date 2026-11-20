import Phaser from 'phaser';
import {
    COLORS,
    DEPTH,
    FONT_FAMILY,
    GAME_WIDTH,
    SCENE_KEYS,
    toCss
} from '../config/constants.js';
import { createNightSky } from '../ui/NightStage.js';
import MenuList from '../ui/MenuList.js';

// Tela PROVISÓRIA, usada só para validar a transição entre cenas.
// A garagem de verdade (escolha de carreira, equipamentos) virá depois.
export default class GarageScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.GARAGE);
    }

    create() {
        this.transitioning = false;
        this.cameras.main.fadeIn(400, 0, 0, 0);

        createNightSky(this);

        const centerX = GAME_WIDTH / 2;

        this.add
            .text(centerX, 150, 'GARAGEM', {
                fontFamily: FONT_FAMILY,
                fontSize: '48px',
                color: toCss(COLORS.YELLOW)
            })
            .setOrigin(0.5)
            .setShadow(5, 5, toCss(COLORS.MAGENTA), 0, false, true)
            .setDepth(DEPTH.UI);

        const notice = this.add
            .text(centerX, 250, 'EM CONSTRUÇÃO', {
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
            y: 380,
            items: [{ label: 'VOLTAR', onSelect: () => this.backToMenu() }]
        });

        this.input.keyboard.on('keydown-ESC', () => this.backToMenu());
    }

    backToMenu() {
        if (this.transitioning) return;
        this.transitioning = true;
        this.menu.lock();

        const camera = this.cameras.main;
        camera.fadeOut(400, 0, 0, 0);
        camera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start(SCENE_KEYS.MENU);
        });
    }
}
