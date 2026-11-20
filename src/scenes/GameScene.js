import Phaser from 'phaser';
import {
    COLORS,
    DEPTH,
    FONT_FAMILY,
    JUDGMENT_COLORS,
    RHYTHM,
    SCENE_KEYS,
    toCss
} from '../config/constants.js';
import { DEFAULT_SONG, beatDurationMs, buildChart } from '../data/songs.js';
import { getCareer } from '../systems/CareerSystem.js';
import NoteJudge, { JUDGMENTS } from '../systems/JudgmentSystem.js';
import ScoreSystem from '../systems/ScoreSystem.js';
import SongAudio from '../systems/SongAudio.js';
import SongClock from '../systems/SongClock.js';
import { ensureCharacterTextures } from '../ui/characters.js';
import Highway, { highwayCenterX, laneX } from '../ui/Highway.js';
import { burst, ring } from '../ui/HitEffects.js';
import { NOTE_SCALE, ensureNoteTextures, noteTextureKey } from '../ui/NoteSprites.js';
import { createNightSky, createSpotlights } from '../ui/NightStage.js';
import ResultsPanel from '../ui/ResultsPanel.js';
import RhythmHud from '../ui/RhythmHud.js';
import Toast from '../ui/Toast.js';
import { fadeToScene } from '../ui/transitions.js';

const { HIT_Y, SPAWN_Y, APPROACH_MS, LEAD_IN_BEATS, LANE_KEYS, LANE_COLORS } = RHYTHM;
const NOTE_SPEED = (HIT_Y - SPAWN_Y) / APPROACH_MS; // pixels por ms
const RESULTS_DELAY_MS = 800; // pausa depois da última nota antes do resultado

const COUNT_IN_LABELS = { [-LEAD_IN_BEATS]: 'PREPARE-SE', [-3]: '3', [-2]: '2', [-1]: '1', 0: 'VAI!' };

// Minigame de ritmo. O tempo vem do SongClock: a posição das notas e o julgamento dos
// toques usam o tempo da música, nunca a contagem de quadros nem timers por nota.
export default class GameScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.GAME);
    }

    create() {
        this.transitioning = false;
        this.finished = false;
        this.results = null;
        this.cameras.main.fadeIn(400, 0, 0, 0);

        this.song = DEFAULT_SONG;
        this.beatMs = beatDurationMs(this.song);
        this.chart = buildChart(this.song);
        this.lastNoteTime = this.chart[this.chart.length - 1].time;
        this.songEnd = this.lastNoteTime + RESULTS_DELAY_MS;

        this.judge = new NoteJudge(this.chart, LANE_KEYS.length);
        this.score = new ScoreSystem();
        this.noteSprites = new Map(); // id da nota -> imagem na tela
        this.nextSpawn = 0;
        this.lastBeat = -Infinity;

        ensureCharacterTextures(this);
        ensureNoteTextures(this);
        createNightSky(this);
        createSpotlights(this);

        this.highway = new Highway(this);
        this.hud = new RhythmHud(this, { song: this.song, career: getCareer(this) });
        this.judgmentPopup = new Toast(this, {
            x: highwayCenterX,
            y: HIT_Y - 70,
            fontSize: 24,
            holdMs: 350,
            fadeMs: 250,
            rise: 16,
            pop: true
        });
        this.callout = new Toast(this, {
            x: highwayCenterX,
            y: 230,
            color: COLORS.WHITE,
            fontSize: 32,
            holdMs: 300,
            fadeMs: 200,
            rise: 0,
            pop: true
        });
        this.add
            .text(24, 512, 'ESC: SAIR', {
                fontFamily: FONT_FAMILY,
                fontSize: '10px',
                color: toCss(COLORS.GREY)
            })
            .setDepth(DEPTH.UI);

        this.hud.update(this.score);
        this.bindKeys();

        // Relógio e áudio começam juntos: o tempo 0 chega depois da contagem.
        this.clock = new SongClock();
        this.clock.start(LEAD_IN_BEATS * this.beatMs);
        this.audio = new SongAudio(this);
        this.audio.start(this.song, () => this.clock.now());

        // O relógio é do mundo real: se o jogo pausar o áudio ao perder o foco, ele sairia de sincronia.
        const pauseOnBlur = this.sound.pauseOnBlur;
        this.sound.pauseOnBlur = false;
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.sound.pauseOnBlur = pauseOnBlur;
            this.audio.stop();
        });
    }

    bindKeys() {
        const keyboard = this.input.keyboard;

        LANE_KEYS.forEach((key, lane) => {
            keyboard.on(`keydown-${key}`, (event) => {
                if (!event.repeat) this.pressLane(lane, this.clock.eventTime(event));
            });
            keyboard.on(`keyup-${key}`, () => this.highway.release(lane));
        });

        keyboard.on('keydown-ESC', () => this.exitToGarage());
    }

    update() {
        if (this.finished) return;

        const songTime = this.clock.now();
        this.updateBeat(songTime);
        this.spawnNotes(songTime);

        this.judge.expire(songTime).forEach((result) => this.handleJudgment(result));
        this.moveNotes(songTime);
        this.highway.setProgress(songTime / this.songEnd);

        if (this.judge.finished && songTime >= this.songEnd) this.showResults();
    }

    // A cada tempo da música: contagem regressiva e pulinho do músico.
    updateBeat(songTime) {
        const beat = Math.floor(songTime / this.beatMs);
        if (beat === this.lastBeat) return;
        this.lastBeat = beat;

        if (COUNT_IN_LABELS[beat]) this.callout.show(COUNT_IN_LABELS[beat]);
        if (beat >= 0) this.hud.hop();
    }

    // Cria a imagem de cada nota quando ela entra no tempo de aproximação.
    spawnNotes(songTime) {
        while (this.nextSpawn < this.chart.length) {
            const note = this.chart[this.nextSpawn];
            if (note.time - songTime > APPROACH_MS) break;

            const sprite = this.add
                .image(laneX(note.lane), SPAWN_Y, noteTextureKey(note.lane))
                .setScale(NOTE_SCALE)
                .setDepth(DEPTH.NOTES);
            this.noteSprites.set(note.id, { note, sprite });
            this.nextSpawn++;
        }
    }

    // Posição = linha de acerto - (quanto falta para a nota) x velocidade. Só depende do tempo.
    moveNotes(songTime) {
        this.noteSprites.forEach(({ note, sprite }) => {
            sprite.y = HIT_Y - (note.time - songTime) * NOTE_SPEED;
        });
    }

    pressLane(lane, songTime) {
        if (this.finished || this.transitioning) return;

        this.highway.press(lane);
        const result = this.judge.press(lane, songTime);
        if (result) this.handleJudgment(result);
    }

    handleJudgment({ note, judgment }) {
        this.score.register(judgment);
        this.hud.update(this.score);
        this.hud.pulseCombo(judgment === JUDGMENTS.MISS);

        this.judgmentPopup.show(judgment === JUDGMENTS.MISS ? 'MISS' : `${judgment}!`, JUDGMENT_COLORS[judgment]);
        this.playNoteEffect(note, judgment);

        if (judgment === JUDGMENTS.MISS) {
            this.audio.playMiss();
        } else {
            this.audio.playHit(note.lane, judgment);
        }
    }

    // Efeito de cada avaliação sobre a nota correspondente.
    playNoteEffect(note, judgment) {
        const entry = this.noteSprites.get(note.id);
        this.noteSprites.delete(note.id);

        const x = laneX(note.lane);
        const laneColor = LANE_COLORS[note.lane];

        if (judgment === JUDGMENTS.MISS) {
            this.highway.flashMiss(note.lane, JUDGMENT_COLORS.MISS);
            if (entry) {
                // A nota perdida escurece e continua caindo até sumir.
                entry.sprite.setTint(0x555566);
                this.tweens.add({
                    targets: entry.sprite,
                    y: entry.sprite.y + 90,
                    alpha: 0,
                    duration: 400,
                    onComplete: () => entry.sprite.destroy()
                });
            }
            return;
        }

        entry?.sprite.destroy();
        if (judgment === JUDGMENTS.PERFECT) {
            ring(this, x, HIT_Y, { color: laneColor, grow: 2 });
            burst(this, x, HIT_Y, { colors: [COLORS.YELLOW, COLORS.WHITE, laneColor], count: 10, distance: 64 });
        } else {
            ring(this, x, HIT_Y, { color: JUDGMENT_COLORS.GOOD, grow: 1.5, duration: 240 });
            burst(this, x, HIT_Y, { colors: [JUDGMENT_COLORS.GOOD, laneColor], count: 5, distance: 38, size: 5 });
        }
    }

    showResults() {
        this.finished = true;

        this.results = new ResultsPanel(this, {
            song: this.song,
            score: this.score,
            onRetry: () => this.retry(),
            onExit: () => this.exitToGarage()
        });
    }

    retry() {
        if (fadeToScene(this, SCENE_KEYS.GAME)) this.results.lock();
    }

    exitToGarage() {
        this.audio.stop();
        if (fadeToScene(this, SCENE_KEYS.GARAGE, 400)) this.results?.lock();
    }
}
