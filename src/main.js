import Phaser from 'phaser';
import { COLORS, FONT_NAME, GAME_HEIGHT, GAME_WIDTH, toCss } from './config/constants.js';
import MenuScene from './scenes/MenuScene.js';
import CareerScene from './scenes/CareerScene.js';
import GarageScene from './scenes/GarageScene.js';
import SongSelectScene from './scenes/SongSelectScene.js';
import GameScene from './scenes/GameScene.js';

const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container',
    backgroundColor: toCss(COLORS.SKY_BANDS[0]),
    scene: [MenuScene, CareerScene, GarageScene, SongSelectScene, GameScene],
    pixelArt: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// O Phaser mede o texto ao criá-lo, então a fonte precisa estar pronta antes.
// Se a internet cair (ou o Google Fonts demorar), seguimos com a fonte
// alternativa definida em FONT_FAMILY, sem travar o jogo.
async function waitForFont(timeoutMs = 2500) {
    if (!document.fonts) return;

    const load = document.fonts.load(`16px "${FONT_NAME}"`).catch(() => {});
    const timeout = new Promise((resolve) => setTimeout(resolve, timeoutMs));
    await Promise.race([load, timeout]);
}

waitForFont().then(() => {
    const game = new Phaser.Game(config);

    // Facilita inspecionar o jogo pelo console durante o desenvolvimento.
    if (import.meta.env.DEV) window.game = game;
});
