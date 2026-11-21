import Phaser from 'phaser';
import {
    COLORS,
    DEPTH,
    FONT_FAMILY,
    GAME_HEIGHT,
    GAME_WIDTH,
    JUDGMENT_COLORS,
    SCENE_KEYS,
    toCss
} from '../config/constants.js';
import { DIFFICULTY_LABELS, SONGS, formatDuration, songDurationMs } from '../data/songs.js';
import { getSelectedSong, setSelectedSong } from '../systems/SongSelection.js';
import { createNightSky, createSpotlights } from '../ui/NightStage.js';
import PixelButton from '../ui/PixelButton.js';
import { fadeToScene } from '../ui/transitions.js';

const CARD = { width: 820, height: 104, gap: 14, top: 112 };
const DIFFICULTY_COLORS = { 1: JUDGMENT_COLORS.GOOD, 2: COLORS.YELLOW, 3: JUDGMENT_COLORS.MISS };
const IDLE_FILL = 0x0b0714;
const SELECTED_FILL = 0x2a1650;

const textStyle = (size, color) => ({ fontFamily: FONT_FAMILY, fontSize: `${size}px`, color: toCss(color) });

// Seleção de músicas: um card por música do catálogo (src/data/songs.js), navegável por
// teclado (setas/W/S, Enter, ESC) e mouse. Confirmar inicia o minigame com a música escolhida.
export default class SongSelectScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.SONG_SELECT);
    }

    create() {
        this.transitioning = false;
        this.cameras.main.fadeIn(400, 0, 0, 0);

        createNightSky(this);
        createSpotlights(this);

        this.add
            .text(GAME_WIDTH / 2, 52, 'ESCOLHA A MÚSICA', textStyle(32, COLORS.YELLOW))
            .setOrigin(0.5)
            .setShadow(4, 4, toCss(COLORS.MAGENTA), 0, false, true)
            .setDepth(DEPTH.UI);

        this.cards = SONGS.map((song, i) => this.createCard(song, i));
        this.createButtons();

        this.add
            .text(GAME_WIDTH / 2, GAME_HEIGHT - 16, 'SETAS: ESCOLHER   ENTER: TOCAR   ESC: VOLTAR', textStyle(10, COLORS.WHITE))
            .setOrigin(0.5)
            .setAlpha(0.7)
            .setDepth(DEPTH.UI);

        this.bindKeyboard();
        this.select(Math.max(0, SONGS.indexOf(getSelectedSong(this))));
    }

    createCard(song, index) {
        const x = GAME_WIDTH / 2;
        const y = CARD.top + CARD.height / 2 + index * (CARD.height + CARD.gap);
        const left = x - CARD.width / 2;
        const right = x + CARD.width / 2;
        const depth = DEPTH.UI;

        const shadow = this.add.rectangle(x + 5, y + 5, CARD.width, CARD.height, COLORS.MAGENTA).setDepth(depth);
        const background = this.add
            .rectangle(x, y, CARD.width, CARD.height, IDLE_FILL)
            .setStrokeStyle(4, COLORS.STAGE_EDGE)
            .setDepth(depth)
            .setInteractive({ useHandCursor: true });

        const title = this.add.text(left + 28, y - 18, song.title, textStyle(22, COLORS.WHITE)).setOrigin(0, 0.5).setDepth(depth);
        this.add.text(left + 28, y + 20, song.style, textStyle(11, COLORS.CYAN)).setOrigin(0, 0.5).setDepth(depth);

        // Colunas de informação: duração, BPM e dificuldade (rótulo pequeno + valor).
        const stat = (columnX, label, value, color = COLORS.WHITE) => {
            this.add.text(columnX, y - 22, label, textStyle(8, COLORS.GREY)).setDepth(depth);
            this.add.text(columnX, y - 4, value, textStyle(14, color)).setDepth(depth);
        };
        stat(right - 350, 'DURAÇÃO', formatDuration(songDurationMs(song)));
        stat(right - 240, 'BPM', String(song.bpm));
        const difficultyColor = DIFFICULTY_COLORS[song.difficulty];
        stat(right - 140, 'DIFICULDADE', DIFFICULTY_LABELS[song.difficulty], difficultyColor);

        // Três quadradinhos: quantos estão acesos indica a dificuldade.
        for (let i = 0; i < 3; i++) {
            this.add
                .rectangle(right - 140 + i * 16, y + 30, 12, 8, i < song.difficulty ? difficultyColor : 0x2a1a4a)
                .setOrigin(0, 0.5)
                .setDepth(depth);
        }

        background.on('pointerover', () => !this.transitioning && this.select(index));
        background.on('pointerdown', () => {
            this.select(index);
            this.confirm();
        });

        return { background, shadow, title };
    }

    createButtons() {
        this.backButton = new PixelButton(this, {
            x: 200,
            y: 492,
            width: 200,
            height: 40,
            fontSize: 14,
            label: 'VOLTAR',
            color: COLORS.CYAN,
            onClick: () => this.back()
        });
        this.playButton = new PixelButton(this, {
            x: 760,
            y: 492,
            width: 200,
            height: 40,
            fontSize: 14,
            label: 'TOCAR',
            onClick: () => this.confirm()
        });
    }

    bindKeyboard() {
        const keyboard = this.input.keyboard;
        ['UP', 'W'].forEach((key) => keyboard.on(`keydown-${key}`, () => this.move(-1)));
        ['DOWN', 'S'].forEach((key) => keyboard.on(`keydown-${key}`, () => this.move(1)));
        ['ENTER', 'SPACE'].forEach((key) => keyboard.on(`keydown-${key}`, () => this.confirm()));
        keyboard.on('keydown-ESC', () => this.back());
    }

    move(direction) {
        if (this.transitioning) return;
        this.select((this.selectedIndex + direction + SONGS.length) % SONGS.length);
    }

    // Destaca o card escolhido: borda amarela, fundo mais claro e título amarelo.
    select(index) {
        this.selectedIndex = index;
        this.cards.forEach((card, i) => {
            const selected = i === index;
            card.background.setFillStyle(selected ? SELECTED_FILL : IDLE_FILL);
            card.background.setStrokeStyle(4, selected ? COLORS.YELLOW : COLORS.STAGE_EDGE);
            card.title.setColor(toCss(selected ? COLORS.YELLOW : COLORS.WHITE));
            card.shadow.setVisible(selected);
        });
    }

    confirm() {
        if (this.transitioning) return;
        setSelectedSong(this, SONGS[this.selectedIndex].id);
        fadeToScene(this, SCENE_KEYS.GAME);
    }

    back() {
        fadeToScene(this, SCENE_KEYS.GARAGE, 400);
    }
}
