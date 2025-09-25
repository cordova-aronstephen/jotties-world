export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    init(data) {
        this.mainScene = data?.mainScene ?? null;
        this.registry.set('volumeMusic', this.registry.get('volumeMusic') ?? 0.6);
        this.registry.set('volumeAmbient', this.registry.get('volumeAmbient') ?? 0.5);
        this.registry.set('volumeSFX', this.registry.get('volumeSFX') ?? 0.7);
    }

    create() {
        const { width, height } = this.scale;
        const cx = width / 2;
        const cy = height / 2;

        // dark overlay
        this.add.rectangle(cx, cy, width, height, 0x000000, 0.5).setInteractive();

        // background panel
        this.panel = this.add.rectangle(cx, cy, Math.min(900, width * 0.6), Math.min(600, height * 0.6), 0xFFE4B5, 0.95)
            .setStrokeStyle(6, 0x8B5A2B);

        // container to hold current view contents
        this.viewContainer = this.add.container();

        // build the main menu first
        this.buildMainView();

        // ESC closes menu
        this.input.keyboard.on('keydown-ESC', () => {
            this.resumeFromMenu();
        });
    }

    // -------- Views --------
    clearView() {
        this.viewContainer.removeAll(true); // destroy children
    }

    buildMainView() {
        this.clearView();
        const { width, height } = this.scale;
        const cx = width / 2, cy = height / 2;

        const title = this.add.text(cx, cy - 180, 'Game Menu', {
            fontFamily: 'Georgia',
            fontSize: '40px',
            color: '#4b3832'
        }).setOrigin(0.5);

        this.viewContainer.add(title);

        this._addButton(cx, cy - 60, 'Resume', () => this.resumeFromMenu());
        this._addButton(cx, cy, 'Volume', () => this.buildVolumeView());
        this._addButton(cx, cy + 60, 'Controls', () => this.buildControlsView());
        this._addButton(cx, cy + 120, 'Back to Title', () => {
            this.sound.stopAll();
            this.scene.stop('MainScene');
            this.scene.start('BootScene');
        });
    }

    buildVolumeView() {
        this.clearView();
        const { width, height } = this.scale;
        const cx = width / 2, cy = height / 2;

        const title = this.add.text(cx, cy - 200, 'Volume Settings', {
            fontFamily: 'Georgia',
            fontSize: '30px',
            color: '#2e2e2e'
        }).setOrigin(0.5);
        this.viewContainer.add(title);

        this._addSlider(cx, cy - 80, 'Music', this.registry.get('volumeMusic'), (v) => {
            this.registry.set('volumeMusic', v);
            if (this.mainScene?.mainMusic) this.mainScene.mainMusic.setVolume(v);
        });

        this._addSlider(cx, cy - 20, 'Ambient', this.registry.get('volumeAmbient'), (v) => {
            this.registry.set('volumeAmbient', v);
            if (this.mainScene?.ambient) this.mainScene.ambient.setVolume(v);
        });

        this._addSlider(cx, cy + 40, 'SFX', this.registry.get('volumeSFX'), (v) => {
            this.registry.set('volumeSFX', v);
        });

        this._addSmallButton(cx, cy + 150, 'Back', () => this.buildMainView());
    }

    buildControlsView() {
        this.clearView();
        const { width, height } = this.scale;
        const cx = width / 2, cy = height / 2;

        const title = this.add.text(cx, cy - 160, 'Controls', {
            fontFamily: 'Georgia',
            fontSize: '30px',
            color: '#2e2e2e'
        }).setOrigin(0.5);
        this.viewContainer.add(title);

        const lines = [
            'Arrow Keys — Move',
            'E — Interact',
            'M — Change Song',
            'ESC — Open/Close Menu'
        ];
        lines.forEach((txt, i) => {
            const t = this.add.text(cx, cy - 60 + i * 40, txt, {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#333'
            }).setOrigin(0.5);
            this.viewContainer.add(t);
        });

        this._addSmallButton(cx, cy + 150, 'Back', () => this.buildMainView());
    }

    // -------- Helpers --------
    _addButton(x, y, label, cb) {
        const rect = this.add.rectangle(x, y, 240, 48, 0xDEB887).setStrokeStyle(3, 0x8B5E3C).setInteractive({ useHandCursor: true });
        const text = this.add.text(x, y, label, { fontFamily: 'Georgia', fontSize: '22px', color: '#000' }).setOrigin(0.5);
        rect.on('pointerover', () => rect.setFillStyle(0xF5DEB3));
        rect.on('pointerout', () => rect.setFillStyle(0xDEB887));
        rect.on('pointerdown', () => cb());
        this.viewContainer.add([rect, text]);
    }

    _addSmallButton(x, y, label, cb) {
        const rect = this.add.rectangle(x, y, 160, 40, 0xCD853F).setStrokeStyle(2, 0x8B5E3C).setInteractive({ useHandCursor: true });
        const text = this.add.text(x, y, label, { fontFamily: 'Georgia', fontSize: '18px', color: '#fff' }).setOrigin(0.5);
        rect.on('pointerover', () => rect.setFillStyle(0xDFAE80));
        rect.on('pointerout', () => rect.setFillStyle(0xCD853F));
        rect.on('pointerdown', () => cb());
        this.viewContainer.add([rect, text]);
    }

    _addSlider(cx, y, label, value, onChange) {
        const trackWidth = 220;
        const left = cx - trackWidth / 2;
        const labelText = this.add.text(left - 100, y, label, { font: '18px Arial', color: '#000' }).setOrigin(0, 0.5);
        const track = this.add.rectangle(cx, y, trackWidth, 6, 0xDADADA);
        const fill = this.add.rectangle(left, y, trackWidth * value, 6, 0x8B5E3C).setOrigin(0, 0.5);
        const knob = this.add.circle(left + trackWidth * value, y, 10, 0x8B5E3C).setInteractive();
        const percent = this.add.text(cx + trackWidth / 2 + 30, y, Math.round(value * 100) + '%', {
            font: '16px Arial', color: '#333'
        }).setOrigin(0.5);

        this.input.setDraggable(knob);

        this.input.on('drag', (pointer, gameObject, dragX) => {
            if (gameObject !== knob) return;
            const clamped = Phaser.Math.Clamp(dragX, left, left + trackWidth);
            knob.x = clamped;
            const v = (clamped - left) / trackWidth;
            fill.width = trackWidth * v;
            percent.setText(Math.round(v * 100) + '%');
            onChange(v);
        });

        this.viewContainer.add([labelText, track, fill, knob, percent]);
    }

    resumeFromMenu() {
        this.scene.stop();
        if (this.mainScene) this.mainScene.scene.resume();
    }
}
