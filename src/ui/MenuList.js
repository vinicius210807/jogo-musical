import { COLORS, DEPTH, FONT_FAMILY, toCss } from '../config/constants.js';

// Menu vertical reutilizável com navegação por teclado (↑/↓, W/S, Enter/Espaço)
// e mouse (hover seleciona, clique confirma). Itens desativados são pulados
// pelo teclado e mostram a dica "EM BREVE".
//
// items: [{ label, enabled = true, onSelect }]
export default class MenuList {
    constructor(scene, { x, y, spacing = 52, fontSize = 24, items }) {
        this.scene = scene;
        this.items = items.map((item) => ({ enabled: true, ...item }));
        this.locked = false;
        this.selectedIndex = this.items.findIndex((item) => item.enabled);

        this.labels = this.items.map((item, i) => this.createItem(item, i, x, y + i * spacing, fontSize));

        this.cursor = scene.add
            .text(0, 0, '>', {
                fontFamily: FONT_FAMILY,
                fontSize: `${fontSize}px`,
                color: toCss(COLORS.MAGENTA)
            })
            .setOrigin(0.5)
            .setDepth(DEPTH.UI);

        scene.tweens.add({
            targets: this.cursor,
            alpha: 0.2,
            duration: 450,
            yoyo: true,
            repeat: -1
        });

        this.bindKeyboard();
        this.refresh();
    }

    createItem(item, index, x, y, fontSize) {
        const label = this.scene.add
            .text(x, y, item.label, {
                fontFamily: FONT_FAMILY,
                fontSize: `${fontSize}px`,
                color: toCss(COLORS.WHITE)
            })
            .setOrigin(0.5)
            .setDepth(DEPTH.UI);

        if (!item.enabled) {
            label.setColor(toCss(COLORS.GREY));
            this.scene.add
                .text(x + label.width / 2 + 16, y, 'EM BREVE', {
                    fontFamily: FONT_FAMILY,
                    fontSize: '12px',
                    color: toCss(COLORS.GREY)
                })
                .setOrigin(0, 0.5)
                .setDepth(DEPTH.UI);
        }

        // Área clicável mais larga que o texto, para facilitar o mouse.
        const hitArea = this.scene.add
            .zone(x, y, 460, fontSize + 24)
            .setInteractive({ useHandCursor: item.enabled });

        hitArea.on('pointerover', () => {
            if (!this.locked && item.enabled) this.select(index);
        });
        hitArea.on('pointerdown', () => {
            if (this.locked) return;
            if (item.enabled) {
                this.select(index);
                this.activate();
            } else {
                this.shake(label);
            }
        });

        return label;
    }

    bindKeyboard() {
        const keyboard = this.scene.input.keyboard;
        keyboard.on('keydown-UP', () => this.move(-1));
        keyboard.on('keydown-W', () => this.move(-1));
        keyboard.on('keydown-DOWN', () => this.move(1));
        keyboard.on('keydown-S', () => this.move(1));
        keyboard.on('keydown-ENTER', () => this.activate());
        keyboard.on('keydown-SPACE', () => this.activate());
    }

    // Move a seleção para o próximo item habilitado (com volta ao início/fim).
    move(direction) {
        if (this.locked) return;

        const total = this.items.length;
        let next = this.selectedIndex;
        for (let i = 0; i < total; i++) {
            next = (next + direction + total) % total;
            if (this.items[next].enabled) {
                this.select(next);
                return;
            }
        }
    }

    select(index) {
        if (index === this.selectedIndex) return;
        this.selectedIndex = index;
        this.refresh();
    }

    activate() {
        if (this.locked) return;
        const item = this.items[this.selectedIndex];
        if (item?.enabled && item.onSelect) item.onSelect();
    }

    // Trava a navegação (usado durante a transição de cena).
    lock() {
        this.locked = true;
    }

    refresh() {
        this.labels.forEach((label, i) => {
            if (!this.items[i].enabled) return;

            const selected = i === this.selectedIndex;
            label.setColor(toCss(selected ? COLORS.YELLOW : COLORS.WHITE));
            label.setShadow(3, 3, toCss(COLORS.MAGENTA), 0, false, selected);
        });

        const current = this.labels[this.selectedIndex];
        this.cursor.setPosition(current.x - current.width / 2 - 32, current.y);
    }

    shake(target) {
        const originX = target.x;
        this.scene.tweens.add({
            targets: target,
            x: originX + 6,
            duration: 50,
            yoyo: true,
            repeat: 2,
            onComplete: () => target.setX(originX)
        });
    }
}
