import { COLORS, DEPTH, FONT_FAMILY, toCss } from '../config/constants.js';

// Menu vertical reutilizável com navegação por teclado (↑/↓, W/S, Enter/Espaço)
// e mouse (hover seleciona, clique confirma).
//
// items: [{ label, enabled = true, hint, onSelect }]
//  - enabled: false  → item cinza, pulado pelo teclado, com a dica "EM BREVE".
//  - hint: texto pequeno ao lado do rótulo (ex.: "EM BREVE") em itens selecionáveis.
//
// Opções: align ('center' | 'left'; em 'left', x é o início do texto), zoneWidth
// (largura da área clicável), hintFontSize e onChange(index), chamado quando a
// seleção muda (e uma vez no início).
export default class MenuList {
    constructor(
        scene,
        {
            x,
            y,
            spacing = 52,
            fontSize = 24,
            align = 'center',
            zoneWidth = 460,
            hintFontSize = 12,
            onChange,
            items
        }
    ) {
        this.scene = scene;
        this.items = items.map((item) => ({ enabled: true, ...item }));
        this.locked = false;
        this.selectedIndex = this.items.findIndex((item) => item.enabled);

        this.fontSize = fontSize;
        this.alignLeft = align === 'left';
        this.zoneWidth = zoneWidth;
        this.hintFontSize = hintFontSize;
        this.onChange = onChange;

        this.labels = this.items.map((item, i) => this.createItem(item, i, x, y + i * spacing));

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
        this.onChange?.(this.selectedIndex);
    }

    createItem(item, index, x, y) {
        const label = this.scene.add
            .text(x, y, item.label, {
                fontFamily: FONT_FAMILY,
                fontSize: `${this.fontSize}px`,
                color: toCss(COLORS.WHITE)
            })
            .setOrigin(this.alignLeft ? 0 : 0.5, 0.5)
            .setDepth(DEPTH.UI);

        if (!item.enabled) label.setColor(toCss(COLORS.GREY));

        const hint = item.hint ?? (item.enabled ? null : 'EM BREVE');
        if (hint) {
            const labelWidth = this.alignLeft ? label.width : label.width / 2;
            this.scene.add
                .text(x + labelWidth + 16, y, hint, {
                    fontFamily: FONT_FAMILY,
                    fontSize: `${this.hintFontSize}px`,
                    color: toCss(COLORS.GREY)
                })
                .setOrigin(0, 0.5)
                .setDepth(DEPTH.UI);
        }

        // Área clicável mais larga que o texto, para facilitar o mouse.
        const zoneX = this.alignLeft ? x - 28 + this.zoneWidth / 2 : x;
        const hitArea = this.scene.add
            .zone(zoneX, y, this.zoneWidth, this.fontSize + 24)
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
        this.onChange?.(index);
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
        const cursorOffset = this.alignLeft ? 24 : current.width / 2 + 32;
        this.cursor.setPosition(current.x - cursorOffset, current.y);
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
