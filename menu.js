// menu.js
export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    init(data) {
        this.mainScene = data.mainScene; // reference to MainScene
        this.music = data.music; // reference to background music
    }

    create() {
        const { width, height } = this.scale;

        // Semi-transparent background overlay
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.4);

        // Menu panel
        const panelWidth = width * 0.5;
        const panelHeight = height * 0.5;
        const panel = this.add.rectangle(width / 2, height / 2, panelWidth, panelHeight, 0xffe4b5, 0.95); // moccasin
        panel.setStrokeStyle(4, 0x000000, 0.8);

        // Title
        this.add.text(width / 2, height / 2 - panelHeight / 2 + 40, "Game Menu", {
            font: "48px Georgia",
            fill: "#000"
        }).setOrigin(0.5);

        // Volume button
        const volumeText = this.add.text(width / 2, height / 2 - 40, "Volume", {
            font: "32px Arial",
            fill: "#000"
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        volumeText.on('pointerdown', () => this.showVolumePanel());

        // Controls button
        const controlsText = this.add.text(width / 2, height / 2 + 20, "Controls", {
            font: "32px Arial",
            fill: "#000"
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        controlsText.on('pointerdown', () => this.showControlsPanel());

        // Back to Boot button
        const backText = this.add.text(width / 2, height / 2 + 80, "Back to Title", {
            font: "32px Arial",
            fill: "#000"
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        backText.on('pointerdown', () => {
            this.scene.stop('MainScene');
            this.scene.start('BootScene');
        });
    }

    showVolumePanel() {
        const { width, height } = this.scale;

        // Clear existing panels
        this.children.removeAll();

        // Volume panel
        this.add.rectangle(width / 2, height / 2, width * 0.4, height * 0.3, 0xffe4b5, 0.95);

        this.add.text(width / 2, height / 2 - 60, "Adjust Volume", {
            font: "32px Arial",
            fill: "#000"
        }).setOrigin(0.5);

        // Volume slider (simplified with 3 options)
        const volumes = [0, 0.5, 1];
        volumes.forEach((v, i) => {
            const txt = this.add.text(width / 2, height / 2 - 10 + i * 40, `${v * 100}%`, {
                font: "28px Arial",
                fill: "#000"
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            txt.on('pointerdown', () => {
                if (this.music) this.music.setVolume(v);
            });
        });

        // Back button
        const backBtn = this.add.text(width / 2, height / 2 + 100, "Back", {
            font: "28px Arial",
            fill: "#000"
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        backBtn.on('pointerdown', () => this.scene.restart());
    }

    showControlsPanel() {
        const { width, height } = this.scale;
        this.children.removeAll();

        this.add.rectangle(width / 2, height / 2, width * 0.5, height * 0.5, 0xffe4b5, 0.95);

        this.add.text(width / 2, height / 2 - 100, "Controls", {
            font: "36px Arial",
            fill: "#000"
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 - 40, "Arrow Keys - Move", { font: "28px Arial", fill: "#000" }).setOrigin(0.5);
        this.add.text(width / 2, height / 2, "E - Interact", { font: "28px Arial", fill: "#000" }).setOrigin(0.5);
        this.add.text(width / 2, height / 2 + 40, "Esc - Open Menu", { font: "28px Arial", fill: "#000" }).setOrigin(0.5);

        // Back button
        const backBtn = this.add.text(width / 2, height / 2 + 120, "Back", {
            font: "28px Arial",
            fill: "#000"
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        backBtn.on('pointerdown', () => this.scene.restart());
    }
}
