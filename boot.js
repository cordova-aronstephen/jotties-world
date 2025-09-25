// boot.js
export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // --- Loading screen style ---
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x2a2a2a)
            .setOrigin(0, 0);

        const loadingText = this.add.text(this.scale.width / 2, this.scale.height / 2 - 60,
            "Loading...", {
                font: "32px Georgia",
                fill: "#ffffff"
            }).setOrigin(0.5);

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(this.scale.width / 2 - 160, this.scale.height / 2 - 20, 320, 40);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(this.scale.width / 2 - 150, this.scale.height / 2 - 10, 300 * value, 20);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.setText("Loading Complete!");
        });

        // --- Core assets needed before menu ---
        this.load.audio('menuTheme', 'assets/audio/stardew_valley_loadgame.m4a');
        this.load.image('player', 'assets/jottie.png'); // for animated background effect
    }

    create() {
        this.scene.start('MenuScene'); // go straight to menu
    }
}
