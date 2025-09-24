// world.js
export class WorldBuilder {
    constructor(scene) {
        this.scene = scene;
        this.map = null;

        // music
        this.music = null;
        this.altMusic = null;

        // ambients
        this.ambients = {};
        this.activeAmbient = null;
    }

    preload() {
        // Load premade map image
        this.scene.load.image('worldMap', 'assets/map.png'); 

        // Background music
        this.scene.load.audio('song1', 'assets/audio/song1.mp3');
        this.scene.load.audio('song2', 'assets/audio/song2.mp3');

        // Ambient loops
        this.scene.load.audio('birds', 'assets/audio/birds.mp3');
        this.scene.load.audio('water', 'assets/audio/water.mp3');
        this.scene.load.audio('house', 'assets/audio/muffled.mp3');
    }

    create(player) {
        // Add the map and scale it up
        this.map = this.scene.add.image(0, 0, 'worldMap').setOrigin(0, 0);

        const scaleX = this.scene.scale.width / this.map.width;
        const scaleY = this.scene.scale.height / this.map.height;
        const scale = Math.max(scaleX, scaleY);
        this.map.setScale(scale);

        const worldWidth = this.map.width * scale;
        const worldHeight = this.map.height * scale;
        this.scene.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        this.map.setDepth(-1);

        // Camera follow player
        this.scene.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.scene.cameras.main.startFollow(player, true, 0.1, 0.1);

        // ------------------------
        // Music setup
        // ------------------------
        this.music = this.scene.sound.add('song1', { loop: true, volume: 0.5 });
        this.altMusic = this.scene.sound.add('song2', { loop: true, volume: 0.5 });

        this.music.play();

        // Switch songs with M
        this.scene.input.keyboard.on('keydown-M', () => {
            if (this.music.isPlaying) {
                this.music.stop();
                this.altMusic.play();
            } else if (this.altMusic.isPlaying) {
                this.altMusic.stop();
                this.music.play();
            }
        });

        // ------------------------
        // Ambient setup
        // ------------------------
        this.ambients = {
            birds: this.scene.sound.add('birds', { loop: true, volume: 0.4 }),
            water: this.scene.sound.add('water', { loop: true, volume: 0.4 }),
            house: this.scene.sound.add('house', { loop: true, volume: 0.2 })
        };

        // Start with birds ambient outside
        this.setAmbient("birds");
    }

    // Function to switch ambients
    setAmbient(key) {
        // Stop old ambient
        if (this.activeAmbient && this.activeAmbient.isPlaying) {
            this.activeAmbient.stop();
        }

        // Play new one
        if (this.ambients[key]) {
            this.activeAmbient = this.ambients[key];
            this.activeAmbient.play();
        }
    }
}
