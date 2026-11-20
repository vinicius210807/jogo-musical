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
import { CAREERS } from '../data/careers.js';
import { getCareer, setCareer } from '../systems/CareerSystem.js';
import { createNightSky, createSpotlights } from '../ui/NightStage.js';
import { ensureCharacterTextures } from '../ui/characters.js';
import CareerCard from '../ui/CareerCard.js';
import PixelButton from '../ui/PixelButton.js';
import { fadeToScene } from '../ui/transitions.js';

const COLUMNS = 2;
const CARD_WIDTH = 400;
const CARD_HEIGHT = 150;
const CARD_GAP_X = 20;
const CARD_GAP_Y = 20;
const GRID_TOP = 100;

// Seleção de carreira: grade 2x2 de cards, botões CONFIRMAR e VOLTAR.
export default class CareerScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.CAREER);
    }

    create() {
        this.transitioning = false;
        this.cameras.main.fadeIn(400, 0, 0, 0);

        createNightSky(this);
        createSpotlights(this);
        ensureCharacterTextures(this);

        this.createTitle();
        this.createCards();
        this.createButtons();
        this.createHint();
        this.bindKeyboard();

        // Se o jogador já tinha escolhido uma carreira, volta com ela marcada.
        const previous = getCareer(this);
        this.select(previous ? CAREERS.indexOf(previous) : 0);
    }

    createTitle() {
        this.add
            .text(GAME_WIDTH / 2, 48, 'ESCOLHA SUA CARREIRA', {
                fontFamily: FONT_FAMILY,
                fontSize: '32px',
                color: toCss(COLORS.YELLOW)
            })
            .setOrigin(0.5)
            .setShadow(4, 4, toCss(COLORS.MAGENTA), 0, false, true)
            .setDepth(DEPTH.UI);
    }

    createCards() {
        const gridWidth = COLUMNS * CARD_WIDTH + (COLUMNS - 1) * CARD_GAP_X;
        const startX = (GAME_WIDTH - gridWidth) / 2 + CARD_WIDTH / 2;
        const startY = GRID_TOP + CARD_HEIGHT / 2;

        this.cards = CAREERS.map((career, i) => {
            const column = i % COLUMNS;
            const row = Math.floor(i / COLUMNS);

            return new CareerCard(this, {
                x: startX + column * (CARD_WIDTH + CARD_GAP_X),
                y: startY + row * (CARD_HEIGHT + CARD_GAP_Y),
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                career,
                onClick: () => this.select(i)
            });
        });
    }

    createButtons() {
        const y = GAME_HEIGHT - 76;

        this.backButton = new PixelButton(this, {
            x: GAME_WIDTH / 2 - 140,
            y,
            label: 'VOLTAR',
            color: COLORS.CYAN,
            onClick: () => this.goBack()
        });

        this.confirmButton = new PixelButton(this, {
            x: GAME_WIDTH / 2 + 140,
            y,
            label: 'CONFIRMAR',
            color: COLORS.YELLOW,
            onClick: () => this.confirm()
        });
    }

    createHint() {
        this.add
            .text(GAME_WIDTH / 2, GAME_HEIGHT - 22, 'SETAS: ESCOLHER   ENTER: CONFIRMAR   ESC: VOLTAR', {
                fontFamily: FONT_FAMILY,
                fontSize: '10px',
                color: toCss(COLORS.GREY)
            })
            .setOrigin(0.5)
            .setDepth(DEPTH.UI);
    }

    bindKeyboard() {
        const keyboard = this.input.keyboard;

        // Na grade 2x2, trocar de coluna inverte o bit 0 do índice e trocar de linha, o bit 1.
        ['LEFT', 'RIGHT', 'A', 'D'].forEach((key) => {
            keyboard.on(`keydown-${key}`, () => this.select(this.selectedIndex ^ 1));
        });
        ['UP', 'DOWN', 'W', 'S'].forEach((key) => {
            keyboard.on(`keydown-${key}`, () => this.select(this.selectedIndex ^ 2));
        });

        keyboard.on('keydown-ENTER', () => this.confirmButton.press());
        keyboard.on('keydown-ESC', () => this.backButton.press());
    }

    select(index) {
        if (this.transitioning) return;
        this.selectedIndex = index;
        this.cards.forEach((card, i) => card.setSelected(i === index));
    }

    // Registra a carreira escolhida (lida depois com getCareer) e segue para a garagem.
    confirm() {
        if (this.transitioning) return;

        setCareer(this, CAREERS[this.selectedIndex].id);
        fadeToScene(this, SCENE_KEYS.GARAGE);
    }

    goBack() {
        fadeToScene(this, SCENE_KEYS.MENU, 400);
    }
}
