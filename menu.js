// menu.js
export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    init(data) {
        this.mainScene = data.mainScene;
        this.music = data.music;
    }

    create() {
        // Fade in overlay
        this.cameras.main.fadeIn(300, 0, 0, 0);

        // Transparent dark background
        this.add.rectangle(1250, 850, 2500, 1700, 0x000000, 0.4);

        // Main menu panel
        const panel = this.add.rectangle(1250, 850, 800, 600, 0xFFE4B5, 0.92) // moccasin
            .setStrokeStyle(6, 0x8B5A2B); // brown border

        // Title
        this.add.text(1250, 550, "Game Menu", {
            fontFamily: 'Georgia, serif',
            fontSize: '64px',
            fontStyle: 'bold',
            color: '#5C4033'
        }).setOrigin(0.5);

        // ------------------------
        // Volume Control (slider with draggable circle)
        // ------------------------
        this.add.text(1050, 700, "Volume", {
            fontFamily: 'Georgia, serif',
            fontSize: '40px',
            color: '#3B2F2F'
        }).setOrigin(0.5);

        const sliderX = 1350;
        const sliderY = 700;
        const sliderWidth = 300;

        // Bar
        const volumeBar = this.add.rectangle(sliderX, sliderY, sliderWidth, 12, 0xD2B48C)
            .setOrigin(0.5);

        // Handle (draggable circle)
        const handle = this.add.circle(sliderX, sliderY, 15, 0x8B4513)
            .setInteractive({ draggable: true });

        // Set initial position
        let currentVolume = this.music ? this.music.volume : 1;
        handle.x = sliderX - sliderWidth / 2 + sliderWidth * currentVolume;

        // Dragging
        this.input.setDraggable(handle);
        this.input.on('drag', (pointer, obj, dragX) => {
            if (obj === handle) {
                const clampedX = Phaser.Math.Clamp(dragX, sliderX - sliderWidth / 2, sliderX + sliderWidth / 2);
                obj.x = clampedX;
                const newVolume = (clampedX - (sliderX - sliderWidth / 2)) / sliderWidth;
                if (this.music) this.music.setVolume(newVolume);
            }
        });

        // ------------------------
        // Controls section
        // ------------------------
        this.add.text(1250, 850, "Controls:\nArrow Keys = Move\nESC/Menu = Pause", {
            fontFamily: 'Courier, monospace',
            fontSize: '32px',
            color: '#2F4F4F',
            align: 'center'
        }).setOrigin(0.5);

        // ------------------------
        // Back to Boot button
        // ------------------------
        const backButton = this.add.text(1250, 1050, "Back to Title", {
            fontFamily: 'Georgia, serif',
            fontSize: '36px',
            backgroundColor: '#CD853F',
            padding: { x: 20, y: 10 },
            color: '#fff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        backButton.on('pointerdown', () => {
            if (this.music) {
                this.music.stop(); // stop MainScene music
            }
            this.scene.stop('MainScene');
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.time.delayedCall(300, () => {
                this.scene.start('BootScene');
                this.scene.stop();
            });
        });

        // ------------------------
        // Resume button
        // ------------------------
        const resumeButton = this.add.text(1250, 1150, "Resume", {
            fontFamily: 'Georgia, serif',
            fontSize: '36px',
            backgroundColor: '#8B4513',
            padding: { x: 20, y: 10 },
            color: '#fff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        resumeButton.on('pointerdown', () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.time.delayedCall(300, () => {
                this.scene.stop(); // close menu
                this.scene.resume('MainScene');
            });
        });
    }
}
