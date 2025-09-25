// menu.js
export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.add.rectangle(0, 0, width, height, 0x1a472a).setOrigin(0, 0);

        // Title
        this.add.text(width / 2, height / 2 - 180, "Jottie's World", {
            font: "48px Georgia",
            fill: "#f5e6c4",
            stroke: "#000",
            strokeThickness: 6
        }).setOrigin(0.5);

        // Buttons
        const startButton = this.add.text(width / 2, height / 2, "Start Game", {
            font: "32px Georgia",
            fill: "#fff",
            backgroundColor: "#00000066",
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive();

        const settingsButton = this.add.text(width / 2, height / 2 + 60, "Settings", {
            font: "28px Georgia",
            fill: "#fff"
        }).setOrigin(0.5).setInteractive();

        const controlsButton = this.add.text(width / 2, height / 2 + 120, "Controls", {
            font: "28px Georgia",
            fill: "#fff"
        }).setOrigin(0.5).setInteractive();

        // Menu interactions
        startButton.on('pointerdown', () => {
            this.sound.stopAll();
            this.scene.start('GameScene');
        });

        settingsButton.on('pointerdown', () => {
            alert("Settings placeholder: adjust volumes & mute options here.");
        });

        controlsButton.on('pointerdown', () => {
            alert("Controls:\nArrow Keys = Move\nE = Interact\nM = Switch Music");
        });

        // Menu theme music
        this.menuMusic = this.sound.add('menuTheme', { loop: true, volume: 0.5 });
        this.menuMusic.play();
    }
}
