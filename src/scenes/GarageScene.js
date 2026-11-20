import Phaser from 'phaser';
import {
    COLORS,
    DEPTH,
    FONT_FAMILY,
    GAME_HEIGHT,
    SCENE_KEYS,
    toCss
} from '../config/constants.js';
import { GARAGE_OPTIONS } from '../data/garageOptions.js';
import { getCareer } from '../systems/CareerSystem.js';
import { getProgress } from '../systems/ProgressSystem.js';
import { characterTextureKey, ensureCharacterTextures } from '../ui/characters.js';
import { CHARACTER_FEET_Y, CHARACTER_X, ROOM_SCALE, createGarageRoom } from '../ui/GarageRoom.js';
import MenuList from '../ui/MenuList.js';
import PlayerHud from '../ui/PlayerHud.js';
import Toast from '../ui/Toast.js';
import { fadeToScene } from '../ui/transitions.js';

// Painel do menu (lado esquerdo).
const PANEL = { x: 16, y: 56, width: 400, height: 444 };
const PANEL_CENTER_X = PANEL.x + PANEL.width / 2;
const MENU_X = 70;
const MENU_Y = 134;
const MENU_SPACING = 56;

// Garagem: ambiente principal do jogador. Mostra o músico e o instrumento da carreira
// escolhida, dinheiro e fama, e o menu TOCAR / EQUIPAMENTOS / CONTRATAR / STATUS.
// Por enquanto são só a interface: nenhuma opção executa uma função real.
export default class GarageScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.GARAGE);
    }

    create() {
        this.transitioning = false;
        this.cameras.main.fadeIn(400, 0, 0, 0);

        ensureCharacterTextures(this);
        createGarageRoom(this);

        this.createCharacter(getCareer(this));
        this.createMenuPanel();

        this.hud = new PlayerHud(this, {
            title: 'GARAGEM',
            ...getProgress(this),
            onBack: () => this.backToMenu()
        });

        this.input.keyboard.on('keydown-ESC', () => this.backToMenu());
    }

    // Músico da carreira escolhida (com o instrumento já desenhado no sprite),
    // sobre o tapete, com uma plaquinha com nome e instrumento.
    createCharacter(career) {
        const plateY = 492;

        this.add
            .rectangle(CHARACTER_X, plateY, 300, 54, 0x0b0714, 0.78)
            .setStrokeStyle(2, career ? career.accent : COLORS.GREY)
            .setDepth(DEPTH.UI);

        if (!career) {
            this.add
                .text(CHARACTER_X, plateY, 'SEM CARREIRA', {
                    fontFamily: FONT_FAMILY,
                    fontSize: '16px',
                    color: toCss(COLORS.GREY)
                })
                .setOrigin(0.5)
                .setDepth(DEPTH.UI);
            return;
        }

        this.add
            .ellipse(CHARACTER_X, CHARACTER_FEET_Y - 2, 120, 14, 0x000000, 0.35)
            .setDepth(DEPTH.PROPS);

        const sprite = this.add
            .image(CHARACTER_X, CHARACTER_FEET_Y, characterTextureKey(career.id))
            .setOrigin(0.5, 1)
            .setScale(ROOM_SCALE)
            .setDepth(DEPTH.CHARACTER);

        // Animação de "respiro" em dois quadros: sobe um pixel de arte e desce.
        this.tweens.add({
            targets: sprite,
            y: CHARACTER_FEET_Y - ROOM_SCALE,
            duration: 1,
            hold: 600,
            yoyo: true,
            repeatDelay: 600,
            repeat: -1
        });

        this.add
            .text(CHARACTER_X, plateY - 11, career.name, {
                fontFamily: FONT_FAMILY,
                fontSize: '16px',
                color: toCss(COLORS.YELLOW)
            })
            .setOrigin(0.5)
            .setDepth(DEPTH.UI);

        this.add
            .text(CHARACTER_X, plateY + 12, career.instrument, {
                fontFamily: FONT_FAMILY,
                fontSize: '12px',
                color: toCss(COLORS.CYAN)
            })
            .setOrigin(0.5)
            .setDepth(DEPTH.UI);
    }

    createMenuPanel() {
        this.add
            .rectangle(PANEL.x, PANEL.y, PANEL.width, PANEL.height, 0x0b0714, 0.88)
            .setOrigin(0)
            .setStrokeStyle(3, COLORS.STAGE_EDGE)
            .setDepth(DEPTH.UI);

        this.add
            .text(MENU_X - 28, 82, 'O QUE VAMOS FAZER?', {
                fontFamily: FONT_FAMILY,
                fontSize: '12px',
                color: toCss(COLORS.CYAN)
            })
            .setOrigin(0, 0.5)
            .setDepth(DEPTH.UI);

        // Linha divisória entre o menu e a descrição.
        this.add
            .rectangle(PANEL.x + 24, 356, PANEL.width - 48, 2, COLORS.STAGE_EDGE)
            .setOrigin(0)
            .setDepth(DEPTH.UI);

        // Descrição da opção selecionada (criada antes do menu, que a atualiza ao iniciar).
        this.description = this.add
            .text(PANEL.x + 24, 376, '', {
                fontFamily: FONT_FAMILY,
                fontSize: '12px',
                color: toCss(COLORS.WHITE),
                lineSpacing: 8,
                wordWrap: { width: PANEL.width - 48 }
            })
            .setDepth(DEPTH.UI);

        this.toast = new Toast(this, { x: PANEL_CENTER_X, y: 472 });

        this.menu = new MenuList(this, {
            x: MENU_X,
            y: MENU_Y,
            spacing: MENU_SPACING,
            fontSize: 20,
            hintFontSize: 10,
            align: 'left',
            zoneWidth: 340,
            onChange: (index) => this.description.setText(GARAGE_OPTIONS[index].description),
            items: GARAGE_OPTIONS.map((option) => ({
                label: option.label,
                hint: option.soon ? 'EM BREVE' : undefined,
                onSelect: () => this.toast.show(option.message)
            }))
        });

        this.add
            .text(PANEL_CENTER_X, GAME_HEIGHT - 20, 'SETAS + ENTER OU MOUSE   ESC: MENU', {
                fontFamily: FONT_FAMILY,
                fontSize: '10px',
                color: toCss(COLORS.WHITE)
            })
            .setOrigin(0.5)
            .setAlpha(0.7)
            .setDepth(DEPTH.UI);
    }

    backToMenu() {
        if (fadeToScene(this, SCENE_KEYS.MENU, 400)) this.menu.lock();
    }
}
