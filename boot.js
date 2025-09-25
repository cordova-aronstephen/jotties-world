// boot.js
export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Background color
        this.cameras.main.setBackgroundColor('#1d2b53'); // Stardew-style deep blue

        // Loading text
        this.loadingText = this.add.text(this.scale.width / 2, this.scale.height / 2 - 60, "Loading...", {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Loading bar graphics
        let barWidth = 400;
        let barHeight = 25;

        let barX = this.scale.width / 2 - barWidth / 2;
        let barY = this.scale.height / 2 - barHeight / 2;

        this.progressBox = this.add.graphics();
        this.progressBox.fillStyle(0x222222, 0.8);
        this.progressBox.fillRect(barX, barY, barWidth, barHeight);

        this.progressBar = this.add.graphics();

        // % text
        this.percentText = this.add.text(this.scale.width / 2, this.scale.height / 2 + 40, "0%", {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Load all assets here so game + menu can use them
        this.load.image('worldMap', 'assets/map.png');
        this.load.image('houseInterior', 'assets/house.png');
        this.load.image('player', 'assets/jottie.png');
        this.load.image('player_alt', 'assets/jottie_1.png');

        this.load.audio('song1', 'assets/audio/stardew_valley_overture.m4a');
        this.load.audio('song2', 'assets/audio/stardew_valley_spring.m4a');
        this.load.audio('birds', 'assets/audio/birds.m4a');
        this.load.audio('water', 'assets/audio/water.m4a');
        this.load.audio('menuTheme', 'assets/audio/stardew_valley_loadgame.m4a');

        // Update progress bar
        this.load.on('progress', (value) => {
            this.progressBar.clear();
            this.progressBar.fillStyle(0x80c271, 1); // Stardew green
            this.progressBar.fillRect(barX + 5, barY + 5, (barWidth - 10) * value, barHeight - 10);

            this.percentText.setText(Math.floor(value * 100) + '%');
        });

        // When complete
        this.load.on('complete', () => {
            this.progressBar.destroy();
            this.progressBox.destroy();
            this.percentText.destroy();

            this.loadingText.setText("Click to Start");
            this.loadingText.setStyle({ fontSize: '32px', color: '#ffe97f' });

            // Wait for user click before moving to menu
            this.input.once('pointerdown', () => {
                this.scene.start('MenuScene');
            });
        });
    }

    create() {
        // Extra background particles for Stardew-like feel
        this.stars = this.add.particles(0, 0, 'player', {
            x: { min: 0, max: this.scale.width },
            y: 0,
            lifespan: 4000,
            speedY: { min: 50, max: 100 },
            scale: { start: 0.05, end: 0 },
            alpha: { start: 0.6, end: 0 },
            frequency: 200
        });
    }
}
