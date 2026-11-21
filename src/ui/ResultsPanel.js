import {
    COLORS,
    DEPTH,
    FONT_FAMILY,
    GAME_HEIGHT,
    GAME_WIDTH,
    JUDGMENT_COLORS,
    toCss
} from '../config/constants.js';
import { DIFFICULTY_LABELS } from '../data/songs.js';
import MenuList from './MenuList.js';

const OVERLAY_DEPTH = DEPTH.UI + 1;
const PANEL = { width: 560, height: 500 };
const ROW_SPACING = 27;

// Nota final pela precisão (pontos feitos / pontos possíveis).
export function rankFor(accuracy) {
    if (accuracy >= 90) return 'S';
    if (accuracy >= 75) return 'A';
    if (accuracy >= 60) return 'B';
    return 'C';
}

// Tela de resultado, desenhada por cima da partida: pontuação, maior combo, acertos e
// erros, mais as opções JOGAR NOVAMENTE e VOLTAR À GARAGEM.
export default class ResultsPanel {
    constructor(scene, { song, score, reward, onRetry, onExit }) {
        const centerX = GAME_WIDTH / 2;
        const top = (GAME_HEIGHT - PANEL.height) / 2;

        scene.add
            .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.78)
            .setOrigin(0)
            .setDepth(OVERLAY_DEPTH)
            .setInteractive(); // bloqueia cliques na partida por baixo

        scene.add
            .rectangle(centerX, GAME_HEIGHT / 2, PANEL.width, PANEL.height, 0x0b0714)
            .setStrokeStyle(4, COLORS.MAGENTA)
            .setDepth(OVERLAY_DEPTH);

        const text = (x, y, value, size, color, origin = [0.5, 0.5]) =>
            scene.add
                .text(x, y, value, { fontFamily: FONT_FAMILY, fontSize: `${size}px`, color: toCss(color) })
                .setOrigin(...origin)
                .setDepth(OVERLAY_DEPTH + 1);

        text(centerX, top + 38, 'FIM DA MÚSICA', 28, COLORS.YELLOW).setShadow(4, 4, toCss(COLORS.MAGENTA), 0, false, true);
        text(centerX, top + 66, song.title, 14, COLORS.CYAN);
        text(centerX, top + 86, `${song.bpm} BPM  -  ${DIFFICULTY_LABELS[song.difficulty]}`, 10, COLORS.GREY);

        const accuracy = score.accuracy;
        const rows = [
            ['PONTUAÇÃO', String(score.score), COLORS.WHITE],
            ['MAIOR COMBO', String(score.maxCombo), COLORS.WHITE],
            ['PERFECT', String(score.counts.PERFECT), JUDGMENT_COLORS.PERFECT],
            ['GOOD', String(score.counts.GOOD), JUDGMENT_COLORS.GOOD],
            ['MISS', String(score.counts.MISS), JUDGMENT_COLORS.MISS],
            ['PRECISÃO', `${Math.round(accuracy)}%`, COLORS.WHITE],
            ['NOTA', rankFor(accuracy), COLORS.YELLOW],
            ['DINHEIRO', `+R$ ${reward.entry.money}`, COLORS.CYAN],
            ['FAMA', `+${reward.entry.fame}`, COLORS.MAGENTA]
        ];

        rows.forEach(([label, value, color], i) => {
            const y = top + 118 + i * ROW_SPACING;
            text(centerX - 230, y, label, 16, color, [0, 0.5]);
            text(centerX + 230, y, value, 16, color, [1, 0.5]);
        });

        const { newRecords } = reward;
        if (newRecords.score || newRecords.accuracy) {
            const what = newRecords.score && newRecords.accuracy ? 'PONTUAÇÃO E PRECISÃO' : newRecords.score ? 'PONTUAÇÃO' : 'PRECISÃO';
            text(centerX, top + 118 + rows.length * ROW_SPACING + 4, `NOVO RECORDE: ${what}!`, 12, COLORS.YELLOW);
        }

        this.menu = new MenuList(scene, {
            x: centerX,
            y: top + 424,
            spacing: 42,
            fontSize: 20,
            depth: OVERLAY_DEPTH + 1,
            items: [
                { label: 'JOGAR NOVAMENTE', onSelect: onRetry },
                { label: 'VOLTAR À GARAGEM', onSelect: onExit }
            ]
        });
    }

    lock() {
        this.menu.lock();
    }
}
