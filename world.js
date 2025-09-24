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

        // house stuff
        this.houseZone = null;
        this.insideHouse = false; // track where we are
        this.houseMap = null;
    }

    preload() {
        // Load premade maps
        this.scene.load.image('worldMap', 'assets/map.png'); 
        this.scene.load.image('houseMap', 'assets/house.png'); // new PNG

        // Background music
        this.scene.load.audio('song1', 'assets/audio/stardew_valley_overture.m4a');
        this.scene.load.audio('song2', 'assets/audio/stardew_valley_spring.m4a');

        // Ambient loops
        this.scene.load.audio('birds', 'assets/audio/birds.m4a');
        this.scene.load.audio('water', 'assets/audio/water.m4a');
    }

    create(player) {
        this.buildWorldMap(player);

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
            birds: this.scene.sound.add('birds', { loop: true, volume: 0.04 }),
            water: this.scene.sound.add('water', { loop: true, volume: 0.4 })
        };

        // Start with birds ambient outside
        this.setAmbient("birds");

        // ------------------------
        // House trigger zone
        // ------------------------
        const houseX = 200;
        const houseY = 207;
        const houseWidth = 53;
        const houseHeight = 105;

        this.houseZone = this.scene.add.zone(houseX, houseY, houseWidth, houseHeight)
            .setOrigin(0, 0);
        this.scene.physics.add.existing(this.houseZone);
        this.houseZone.body.setAllowGravity(false);
        this.houseZone.body.setImmovable(true);

        this.scene.physics.add.overlap(player, this.houseZone, () => {
            if (!this.insideHouse) {
                this.enterHouse(player);
            }
        }, null, this);
    }

    buildWorldMap(player) {
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
    }

    buildHouseMap(player) {
        this.houseMap = this.scene.add.image(0, 0, 'houseMap').setOrigin(0, 0);

        const scaleX = this.scene.scale.width / this.houseMap.width;
        const scaleY = this.scene.scale.height / this.houseMap.height;
        const scale = Math.max(scaleX, scaleY);
        this.houseMap.setScale(scale);

        const worldWidth = this.houseMap.width * scale;
        const worldHeight = this.houseMap.height * scale;
        this.scene.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        this.houseMap.setDepth(-1);

        // Reset player position inside house
        player.setPosition(worldWidth / 2, worldHeight - 100);

        // Camera follow
        this.scene.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.scene.cameras.main.startFollow(player, true, 0.1, 0.1);
    }

    enterHouse(player) {
        this.insideHouse = true;

        // Fade transition
        this.scene.cameras.main.fadeOut(800, 0, 0, 0);
        this.scene.cameras.main.once('camerafadeoutcomplete', () => {
            // Destroy world map + zone
            if (this.map) this.map.destroy();
            if (this.houseZone) this.houseZone.destroy();

            // Stop birds, switch ambient
            this.setAmbient("water");
            this.music.stop();
            this.altMusic.play();

            // Build house interior
            this.buildHouseMap(player);

            // Fade back in
            this.scene.cameras.main.fadeIn(800, 0, 0, 0);
        });
    }

    // Function to switch ambients
    setAmbient(key) {
        if (this.activeAmbient && this.activeAmbient.isPlaying) {
            this.activeAmbient.stop();
        }

        if (this.ambients[key]) {
            this.activeAmbient = this.ambients[key];
            this.activeAmbient.play();
        }
    }
}
