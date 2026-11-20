import { RHYTHM } from '../config/constants.js';

// Áudio PROVISÓRIO do minigame, sintetizado por código com a Web Audio API (sem arquivos
// e sem direitos autorais): contagem, bateria e baixo agendados no relógio do áudio, e
// um som por nota acertada. Se a música tiver `audioKey` carregada, toca a faixa real.
//
// O agendamento é relativo ao tempo da música: `start` recebe uma função que devolve o
// tempo atual da música (ms), então o áudio fica alinhado com o SongClock.

const HIT_NOTES = ['A4', 'C5', 'E5', 'G5'];
const SEMITONES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

function noteToFreq(name) {
    const [, letter, accidental, octave] = /^([A-G])([#b])?(\d)$/.exec(name);
    const semitone = SEMITONES[letter] + (accidental === '#' ? 1 : accidental === 'b' ? -1 : 0);
    const midi = 12 * (Number(octave) + 1) + semitone;
    return 440 * 2 ** ((midi - 69) / 12);
}

export default class SongAudio {
    constructor(scene) {
        this.scene = scene;
        this.ctx = scene.sound?.context ?? null;
        this.master = null;
        this.noise = null;
        this.sources = [];
        this.track = null;
        this.stopped = false;
    }

    // Agenda a música a partir do tempo atual (normalmente a contagem, valor negativo).
    async start(song, getSongTime) {
        if (song.audioKey && this.scene.cache.audio.exists(song.audioKey)) {
            this.startTrack(song, getSongTime());
            return;
        }

        if (!(await this.resume())) return;
        this.zero = this.ctx.currentTime - getSongTime() / 1000;
        this.scheduleBacking(song);
    }

    // Faixa de áudio real (preparado, ainda sem arquivo no projeto): toca no tempo 0.
    startTrack(song, songTimeNow) {
        this.track = this.scene.sound.add(song.audioKey);
        this.scene.time.delayedCall(Math.max(0, -songTimeNow), () => {
            if (!this.stopped) this.track.play();
        });
    }

    // Garante um AudioContext rodando. Devolve false se o navegador não deixar (jogo segue mudo).
    async resume() {
        if (!this.ctx) return false;
        if (this.ctx.state !== 'running') {
            await Promise.race([
                this.ctx.resume().catch(() => {}),
                new Promise((resolve) => setTimeout(resolve, 400))
            ]);
        }
        if (this.stopped || this.ctx.state !== 'running') return false;

        if (!this.master) {
            this.master = this.ctx.createGain();
            this.master.gain.value = 0.5;
            this.master.connect(this.ctx.destination);
        }
        return true;
    }

    scheduleBacking(song) {
        const beat = 60 / song.bpm;
        const totalBeats = song.bars.length * song.beatsPerBar;
        const at = (beatPosition) => this.zero + beatPosition * beat;

        for (let b = -RHYTHM.LEAD_IN_BEATS; b < 0; b++) {
            this.tone(b === -RHYTHM.LEAD_IN_BEATS ? 2000 : 1400, 'square', at(b), 0.05, 0.12);
        }

        for (let b = 0; b < totalBeats; b++) {
            this.kick(at(b));
            if (b % 2 === 1) this.snare(at(b));
            this.hat(at(b + 0.5));

            const root = noteToFreq(song.bassRoots[Math.floor(b / song.beatsPerBar) % song.bassRoots.length]);
            this.tone(root, 'square', at(b), beat * 0.4, 0.1);
            this.tone(b % 2 ? root * 2 : root, 'square', at(b + 0.5), beat * 0.4, 0.08);
        }
    }

    // Som da nota acertada: cada pista toca uma nota da escala (lá menor pentatônica).
    playHit(lane, judgment) {
        if (!this.master || this.stopped) return;
        const now = this.ctx.currentTime;
        const freq = noteToFreq(HIT_NOTES[lane]);
        const perfect = judgment === 'PERFECT';

        this.tone(freq, 'square', now, 0.16, perfect ? 0.2 : 0.12);
        if (perfect) this.tone(freq * 2, 'triangle', now, 0.2, 0.12);
    }

    playMiss() {
        if (!this.master || this.stopped) return;
        this.tone(80, 'sawtooth', this.ctx.currentTime, 0.18, 0.15);
    }

    stop() {
        this.stopped = true;
        this.track?.stop();
        this.sources.forEach((source) => {
            try {
                source.stop();
            } catch {
                // já terminou
            }
        });
        this.sources = [];
        this.master?.disconnect();
    }

    // --- Sintetizadores simples ---

    tone(freq, type, when, duration, volume) {
        if (!this.canSchedule(when)) return;

        const osc = this.ctx.createOscillator();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, when);
        this.envelope(osc, when, duration, volume);
    }

    kick(when) {
        if (!this.canSchedule(when)) return;

        const osc = this.ctx.createOscillator();
        osc.frequency.setValueAtTime(150, when);
        osc.frequency.exponentialRampToValueAtTime(45, when + 0.12);
        this.envelope(osc, when, 0.16, 0.5);
    }

    snare(when) {
        this.noiseBurst(when, 0.12, 0.25, 1200);
        this.tone(190, 'triangle', when, 0.08, 0.15);
    }

    hat(when) {
        this.noiseBurst(when, 0.04, 0.12, 7000);
    }

    noiseBurst(when, duration, volume, highpassHz) {
        if (!this.canSchedule(when)) return;

        if (!this.noise) {
            const length = Math.floor(this.ctx.sampleRate * 0.3);
            this.noise = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
            const data = this.noise.getChannelData(0);
            for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = this.noise;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = highpassHz;
        source.connect(filter);
        this.envelope(source, when, duration, volume, filter);
    }

    // Liga `node` ao master com um volume que decai rápido, e agenda início e fim.
    envelope(node, when, duration, volume, output = node) {
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(volume, when);
        gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
        output.connect(gain);
        gain.connect(this.master);

        node.start(when);
        node.stop(when + duration + 0.02);
        this.sources.push(node);
    }

    // Só agenda sons que ainda estão no futuro (ou no instante atual).
    canSchedule(when) {
        return this.master && !this.stopped && when >= this.ctx.currentTime - 0.01;
    }
}
