// boot.js
export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Background image for the boot/loading page
        this.load.image('bootBg', 'assets/boot_bg.png'); // <-- replace with your own bg later
        this.load.audio('bootMusic', 'assets/audio/stardew_valley_loadgame.m4a');
    }

    create() {
        // Background stretched to fill screen
        const { width, height } = this.scale;
        this.add.image(width / 2, height / 2, 'bootBg')
            .setOrigin(0.5)
            .setDisplaySize(width, height);

        // Boot music
        this.bootMusic = this.sound.add('bootMusic', { loop: true, volume: 0.5 });
        this.bootMusic.play();

        // Floating panel in the middle
        const panelWidth = width * 0.6;
        const panelHeight = height * 0.3;
        const panelX = width / 2;
        const panelY = height / 2;

        const panel = this.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0x000000, 0.6);
        panel.setStrokeStyle(4, 0xffffff, 0.8);

        // Title text
        this.add.text(panelX, panelY - 60, "Jottie's World", {
            font: "64px Georgia",
            fill: "#fff",
            stroke: "#000",
            strokeThickness: 6
        }).setOrigin(0.5);

        // Start button
        const startText = this.add.text(panelX, panelY + 30, "Start Game", {
            font: "36px Arial",
            fill: "#ffffaa"
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        startText.on('pointerover', () => {
            startText.setStyle({ fill: "#ff0" });
        });
        startText.on('pointerout', () => {
            startText.setStyle({ fill: "#ffffaa" });
        });
        startText.on('pointerdown', () => {
            this.bootMusic.stop();
            this.scene.start('MenuScene');
        });

        // Small footer text
        this.add.text(width / 2, height - 40, "© 2025 Jottie's World", {
            font: "18px Arial",
            fill: "#ddd"
        }).setOrigin(0.5);
    }
}
