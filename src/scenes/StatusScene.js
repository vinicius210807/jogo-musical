import Phaser from 'phaser';
import { COLORS, DEPTH, FONT_FAMILY, SCENE_KEYS, toCss } from '../config/constants.js';
import { SONGS, formatDuration, songDurationMs } from '../data/songs.js';
import { getCareer } from '../systems/CareerSystem.js';
import { getCareerProgress } from '../systems/CareerProgress.js';
import { createNightSky, createSpotlights } from '../ui/NightStage.js';
import PlayerHud from '../ui/PlayerHud.js';
import { fadeToScene } from '../ui/transitions.js';

const LEFT = { x: 16, y: 56, width: 300, height: 444 };
const RIGHT = { x: 328, y: 56, width: 616 };
const RECORDS = { y: 56, height: 150 };
const HISTORY = { y: 218, height: 282 };

const style = (size, color) => ({ fontFamily: FONT_FAMILY, fontSize: `${size}px`, color: toCss(color) });

const formatDate = (iso) => {
    const date = new Date(iso);
    const two = (n) => String(n).padStart(2, '0');
    return `${two(date.getDate())}/${two(date.getMonth() + 1)}`;
};

// Tela de STATUS da garagem: dinheiro, fama, totais da carreira, recordes por música e as
// últimas apresentações. Só lê os dados (CareerProgress); nada é alterado aqui.
export default class StatusScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.STATUS);
    }

    create() {
        this.transitioning = false;
        this.cameras.main.fadeIn(400, 0, 0, 0);

        createNightSky(this);
        createSpotlights(this);

        const progress = getCareerProgress();
        const summary = progress.summary;

        this.hud = new PlayerHud(this, {
            title: 'STATUS',
            backLabel: '< GARAGEM',
            money: summary.money,
            fame: summary.fame,
            onBack: () => this.back()
        });

        this.createOverview(summary);
        this.createRecords(summary);
        this.createHistory(summary);

        this.add
            .text(480, 526, 'ESC: VOLTAR À GARAGEM', style(10, COLORS.WHITE))
            .setOrigin(0.5)
            .setAlpha(0.7)
            .setDepth(DEPTH.UI);
        this.input.keyboard.on('keydown-ESC', () => this.back());
    }

    panel({ x, y, width, height }, title) {
        this.add
            .rectangle(x, y, width, height, 0x0b0714, 0.9)
            .setOrigin(0)
            .setStrokeStyle(3, COLORS.STAGE_EDGE)
            .setDepth(DEPTH.UI);
        this.add.text(x + 20, y + 16, title, style(12, COLORS.CYAN)).setDepth(DEPTH.UI);
    }

    text(x, y, value, size, color, origin = [0, 0]) {
        return this.add.text(x, y, value, style(size, color)).setOrigin(...origin).setDepth(DEPTH.UI);
    }

    createOverview(summary) {
        this.panel(LEFT, 'CARREIRA');
        const career = getCareer(this);
        this.text(LEFT.x + 20, LEFT.y + 44, career ? career.name : 'SEM CARREIRA', 16, career ? COLORS.YELLOW : COLORS.GREY);

        const rows = [
            ['DINHEIRO', `R$ ${summary.money}`, COLORS.WHITE],
            ['FAMA', String(summary.fame), COLORS.WHITE],
            ['APRESENTAÇÕES', String(summary.performances), COLORS.WHITE],
            ['MÚSICAS JOGADAS', `${summary.songsPlayed}/${SONGS.length}`, COLORS.WHITE],
            ['MELHOR PONTUAÇÃO', String(summary.bestScore), COLORS.YELLOW]
        ];
        rows.forEach(([label, value, color], i) => {
            const y = LEFT.y + 96 + i * 66;
            this.text(LEFT.x + 20, y, label, 10, COLORS.GREY);
            this.text(LEFT.x + 20, y + 20, value, 20, color);
        });
    }

    // Melhor pontuação e melhor precisão de cada música do catálogo.
    createRecords(summary) {
        this.panel({ ...RIGHT, ...RECORDS }, 'RECORDES PESSOAIS');
        const columns = { title: RIGHT.x + 20, duration: RIGHT.x + 330, score: RIGHT.x + 480, accuracy: RIGHT.x + 596 };

        this.text(columns.score, RECORDS.y + 18, 'PONTOS', 8, COLORS.GREY, [1, 0]);
        this.text(columns.accuracy, RECORDS.y + 18, 'PRECISÃO', 8, COLORS.GREY, [1, 0]);

        SONGS.forEach((song, i) => {
            const y = RECORDS.y + 52 + i * 30;
            const record = summary.records[song.id];
            this.text(columns.title, y, song.title, 12, COLORS.WHITE);
            this.text(columns.duration, y, formatDuration(songDurationMs(song)), 10, COLORS.GREY);
            this.text(columns.score, y, record ? String(record.bestScore) : '-', 12, record ? COLORS.YELLOW : COLORS.GREY, [1, 0]);
            this.text(columns.accuracy, y, record ? `${Math.round(record.bestAccuracy)}%` : '-', 12, record ? COLORS.CYAN : COLORS.GREY, [1, 0]);
        });
    }

    createHistory(summary) {
        this.panel({ ...RIGHT, ...HISTORY }, 'ÚLTIMAS APRESENTAÇÕES');
        const cols = { date: RIGHT.x + 20, title: RIGHT.x + 90, score: RIGHT.x + 410, accuracy: RIGHT.x + 490, money: RIGHT.x + 596 };

        if (summary.recent.length === 0) {
            this.text(RIGHT.x + RIGHT.width / 2, HISTORY.y + 140, 'NENHUMA APRESENTAÇÃO AINDA', 12, COLORS.GREY, [0.5, 0.5]);
            return;
        }

        this.text(cols.score, HISTORY.y + 18, 'PONTOS', 8, COLORS.GREY, [1, 0]);
        this.text(cols.accuracy, HISTORY.y + 18, 'PREC.', 8, COLORS.GREY, [1, 0]);
        this.text(cols.money, HISTORY.y + 18, 'GANHOS', 8, COLORS.GREY, [1, 0]);

        summary.recent.forEach((entry, i) => {
            const y = HISTORY.y + 48 + i * 36;
            this.text(cols.date, y, formatDate(entry.date), 10, COLORS.GREY);
            this.text(cols.title, y, entry.songTitle, 10, COLORS.WHITE);
            this.text(cols.score, y, String(entry.score), 10, COLORS.YELLOW, [1, 0]);
            this.text(cols.accuracy, y, `${Math.round(entry.accuracy)}%`, 10, COLORS.CYAN, [1, 0]);
            this.text(cols.money, y, `+R$${entry.money}`, 10, 0x35d56a, [1, 0]);
            this.text(cols.money, y + 14, `+${entry.fame} FAMA`, 8, COLORS.MAGENTA, [1, 0]);
        });
    }

    back() {
        fadeToScene(this, SCENE_KEYS.GARAGE, 400);
    }
}
