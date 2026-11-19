
import Phaser from 'phaser';

class TestScene extends Phaser.Scene {
    constructor() {
        super('TestScene');
    }

    create() {
        this.add.text(400, 250, 'JOGO MUSICAL', {
            fontSize: '48px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(400, 320, 'Nosso jogo está funcionando!', {
            fontSize: '22px',
            color: '#b49e69'
        }).setOrigin(0.5);
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#252525',
    scene: [TestScene],
    pixelArt: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

new Phaser.Game(config);
