import Phaser from 'phaser';
import { COLORS, DEPTH } from '../config/constants.js';
import { createPixelTexture } from './pixelArt.js';

// Cenário da garagem: uma imagem estática (192x108 "pixels de arte", ampliada 5x
// para casar com a escala do personagem) + luz e detalhes animados por cima.
export const ROOM_SCALE = 5;
export const ROOM_KEY = 'garage-room';

const ROOM_W = 192;
const ROOM_H = 108;
const WALL_BOTTOM = 70;

// Onde o personagem fica (em pixels da tela): no centro da porta, em cima do tapete.
export const CHARACTER_X = 660;
export const CHARACTER_FEET_Y = 455;

const INK = 0x15121f;
const FRAME = 0x2a2a3a;
const BRICKS = [0x2b2140, 0x2f2447, 0x271d3a, 0x33284c];
const CARDBOARD = 0xb88a52;

function drawWall(p) {
    p.rect(0, 0, ROOM_W, WALL_BOTTOM, 0x1d1530); // rejunte

    for (let row = 0, y = 0; y < WALL_BOTTOM; row++, y += 4) {
        const offset = row % 2 ? 0 : 5;
        for (let x = -offset; x < ROOM_W; x += 10) {
            const x0 = Math.max(x, 0);
            const width = Math.min(x + 9, ROOM_W) - x0;
            const shade = BRICKS[(row * 3 + Math.floor((x + 10) / 10) * 7) % BRICKS.length];
            if (width > 0) p.rect(x0, y, width, 3, shade);
        }
    }

    // Rodapé.
    p.rect(0, WALL_BOTTOM, ROOM_W, 2, 0x14101f);
    p.rect(0, WALL_BOTTOM, ROOM_W, 1, 0x3a2f55);
}

function drawFloor(p) {
    const floorTop = WALL_BOTTOM + 2;
    p.rect(0, floorTop, ROOM_W, ROOM_H - floorTop, 0x4a3040);

    // Tábuas: faixas cada vez mais altas para dar sensação de profundidade.
    const lines = [floorTop, 76, 81, 87, 94, 102, ROOM_H];
    for (let i = 0; i < lines.length - 1; i++) {
        const top = lines[i];
        const height = lines[i + 1] - top;
        if (i % 2) p.rect(0, top, ROOM_W, height, 0x523648);
        p.rect(0, top, ROOM_W, 1, 0x36222f);
        for (let k = 0; k < 5; k++) {
            p.rect((i * 29 + k * 47) % ROOM_W, top + 1, 1, height - 1, 0x36222f);
        }
    }

    // Luz fria da noite entrando pela porta.
    p.ellipse(132, 79, 34, 4, 0x523850);
}

function drawDoor(p) {
    // Moldura, abertura e trilhos.
    p.rect(93, 13, 78, 57, INK);
    p.rect(96, 16, 72, 52, COLORS.SKY_BANDS[0]);

    // Céu da noite lá fora, em faixas (como no menu).
    const bands = COLORS.SKY_BANDS;
    const bandHeight = Math.ceil(41 / bands.length);
    bands.forEach((color, i) => p.rect(96, 27 + i * bandHeight, 72, bandHeight, color));

    // Estrelas, lua e silhueta das casas.
    [[104, 30], [122, 34], [138, 29], [150, 40], [110, 44]].forEach(([x, y]) =>
        p.rect(x, y, 1, 1, COLORS.WHITE)
    );
    p.ellipse(156, 36, 4, 4, COLORS.WHITE);
    p.ellipse(157, 35, 1, 1, 0xd9d4ee);

    const houses = [[98, 60, 8, 8], [108, 56, 6, 12], [118, 62, 10, 6], [130, 58, 7, 10], [142, 54, 6, 14], [152, 60, 9, 8]];
    houses.forEach(([x, y, w, h]) => p.rect(x, y, w, h, 0x0b0b1e));
    [[110, 59], [132, 61], [144, 58], [154, 63]].forEach(([x, y]) => p.rect(x, y, 1, 1, COLORS.YELLOW));
    p.rect(96, 66, 72, 2, 0x07050f);

    // Porta de enrolar suspensa: lâminas de metal no alto.
    p.rect(96, 16, 72, 11, 0x6b6b80);
    [19, 22, 25].forEach((y) => p.rect(96, y, 72, 1, 0x55556a));
    p.rect(96, 27, 72, 1, FRAME);
    p.rect(129, 25, 6, 2, COLORS.YELLOW);

    // Trilhos laterais e soleira.
    p.rect(96, 16, 1, 52, FRAME);
    p.rect(167, 16, 1, 52, FRAME);
    p.rect(93, 68, 78, 2, FRAME);

    // Varal de bandeirinhas acima da porta.
    p.rect(91, 9, 82, 1, INK);
    const flags = [COLORS.MAGENTA, COLORS.CYAN, COLORS.YELLOW, 0x35d56a];
    for (let i = 0, x = 94; x < 170; i++, x += 6) {
        const color = flags[i % flags.length];
        p.rect(x, 10, 4, 1, color);
        p.rect(x + 1, 11, 2, 1, color);
    }
}

function drawAmps(p) {
    // Amplificador grande.
    p.rect(175, 42, 16, 28, INK);
    p.rect(175, 42, 16, 1, 0x3a2f55);
    p.rect(177, 46, 12, 18, 0x2a2038);
    for (let y = 47; y < 64; y += 2) p.rect(177, y, 12, 1, 0x1f1830);
    [177, 181, 185].forEach((x) => p.rect(x, 43, 2, 2, COLORS.YELLOW));
    p.rect(180, 66, 6, 1, COLORS.GREY);

    // Amplificador pequeno em cima.
    p.rect(177, 34, 12, 8, 0x1b1428);
    p.rect(177, 34, 12, 1, 0x3a2f55);
    p.rect(179, 36, 8, 4, 0x2a2038);

    // Cabo caído até o chão.
    p.line(175, 68, 170, 78, INK);
}

function drawPosters(p) {
    p.rect(174, 12, 9, 15, 0xc2286f);
    p.rect(177, 15, 3, 3, COLORS.YELLOW);
    p.rect(175, 21, 7, 1, COLORS.WHITE);
    p.rect(175, 23, 5, 1, COLORS.WHITE);
    p.rect(173, 11, 1, 1, COLORS.WHITE);
    p.rect(182, 11, 1, 1, COLORS.WHITE);

    p.rect(185, 15, 6, 11, 0x1b9aa0);
    p.rect(187, 18, 2, 5, 0x0b0b1e);
    p.rect(185, 14, 1, 1, COLORS.WHITE);
}

function drawFloorProps(p) {
    // Caixas de papelão (uma sobre a outra).
    p.rect(176, 76, 14, 9, CARDBOARD);
    p.rect(176, 76, 14, 1, 0xd2a86a);
    p.rect(176, 84, 14, 1, 0x8a6538);
    p.rect(182, 76, 2, 9, 0xe8c48a);
    p.rect(179, 71, 9, 5, 0xa57a45);
    p.rect(179, 71, 9, 1, 0xd2a86a);

    // Retorno de palco (monitor) no chão, com cabo até o músico.
    p.rect(98, 89, 12, 3, INK);
    p.rect(99, 87, 10, 2, INK);
    p.rect(100, 85, 8, 2, INK);
    p.rect(101, 86, 6, 1, 0x2a2038);
    p.rect(99, 90, 10, 1, 0x3a2f55);
    p.line(110, 91, 122, 94, INK);

    // Tapete surrado onde o músico fica.
    p.ellipse(132, 90, 20, 4, 0x8a2a3a);
    p.ellipse(132, 90, 17, 3, 0x6e1f2e);
    p.ellipse(132, 90, 9, 1, 0x8a2a3a);
}

function drawRoom(p) {
    drawWall(p);
    drawFloor(p);
    drawDoor(p);
    drawPosters(p);
    drawAmps(p);
    drawFloorProps(p);
}

// Monta o cenário e as animações de ambiente (lâmpada balançando, luz, poeira, LED).
export function createGarageRoom(scene) {
    createPixelTexture(scene, ROOM_KEY, ROOM_W, ROOM_H, drawRoom);

    scene.add
        .image(0, 0, ROOM_KEY)
        .setOrigin(0)
        .setScale(ROOM_SCALE)
        .setDepth(DEPTH.ROOM);

    createAmpLed(scene);
    createBulb(scene);
    createDust(scene);
}

function createAmpLed(scene) {
    const led = scene.add
        .rectangle(188 * ROOM_SCALE, 43 * ROOM_SCALE, ROOM_SCALE, ROOM_SCALE, COLORS.MAGENTA)
        .setOrigin(0)
        .setDepth(DEPTH.PROPS);

    scene.tweens.add({ targets: led, alpha: 0.15, duration: 700, yoyo: true, repeat: -1 });
}

// Lâmpada pelada pendurada no teto: balança devagar e pisca de vez em quando.
function createBulb(scene) {
    const bulb = scene.add.container(CHARACTER_X, 42).setDepth(DEPTH.LIGHT);
    const cord = scene.add.rectangle(0, 0, 2, 44, INK).setOrigin(0.5, 0);
    const socket = scene.add.rectangle(0, 48, 10, 8, FRAME);
    const glass = scene.add.rectangle(0, 59, 12, 12, 0xfff2b0);

    const glows = [
        scene.add.circle(0, 62, 46, 0xffc860, 0.07),
        scene.add.circle(0, 62, 90, 0xffc860, 0.05),
        scene.add.circle(0, 62, 150, 0xffc860, 0.04)
    ];
    glows.forEach((glow) => glow.setBlendMode(Phaser.BlendModes.ADD));
    bulb.add([...glows, cord, socket, glass]);

    bulb.angle = -2;
    scene.tweens.add({
        targets: bulb,
        angle: 2,
        duration: 2400,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
    });

    scene.time.addEvent({
        delay: 3500,
        loop: true,
        callback: () => {
            scene.tweens.add({ targets: glows, alpha: 0.4, duration: 60, yoyo: true, repeat: 2 });
        }
    });
}

// Grãozinhos de poeira flutuando na luz.
function createDust(scene) {
    for (let i = 0; i < 14; i++) {
        const mote = scene.add
            .rectangle(
                Phaser.Math.Between(520, 800),
                Phaser.Math.Between(120, 420),
                2,
                2,
                0xffe9a8
            )
            .setAlpha(Phaser.Math.FloatBetween(0.2, 0.6))
            .setDepth(DEPTH.LIGHT);

        scene.tweens.add({
            targets: mote,
            x: mote.x + Phaser.Math.Between(-18, 18),
            y: mote.y + Phaser.Math.Between(-24, 24),
            alpha: 0.1,
            duration: Phaser.Math.Between(3000, 6000),
            delay: Phaser.Math.Between(0, 2000),
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }
}
