import Phaser from 'phaser';
import { DEPTH } from '../config/constants.js';

// Efeitos simples de acerto, feitos com retângulos que se espalham e somem.

// Quadradinhos saindo em todas as direções.
export function burst(scene, x, y, { colors, count = 8, distance = 56, size = 6, duration = 380 }) {
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + Phaser.Math.FloatBetween(-0.2, 0.2);
        const reach = distance * Phaser.Math.FloatBetween(0.6, 1);
        const spark = scene.add
            .rectangle(x, y, size, size, colors[i % colors.length])
            .setDepth(DEPTH.UI - 1);

        scene.tweens.add({
            targets: spark,
            x: x + Math.cos(angle) * reach,
            y: y + Math.sin(angle) * reach,
            alpha: 0,
            scale: 0.3,
            duration,
            ease: 'Cubic.easeOut',
            onComplete: () => spark.destroy()
        });
    }
}

// Contorno que cresce a partir da nota e some.
export function ring(scene, x, y, { color, width = 72, height = 28, grow = 2, duration = 300 }) {
    const outline = scene.add
        .rectangle(x, y, width, height)
        .setStrokeStyle(4, color)
        .setDepth(DEPTH.UI - 1);

    scene.tweens.add({
        targets: outline,
        scaleX: grow,
        scaleY: grow * 1.6,
        alpha: 0,
        duration,
        ease: 'Cubic.easeOut',
        onComplete: () => outline.destroy()
    });
}
