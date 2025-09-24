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

        // zones
        this.houseZone = null;
        this.doorZone = null;

        this.promptText = null;
        this.inHouse = false;
    }

    preload() {
        this.scene.load.image('worldMap', 'assets/map.png'); 
        this.scene.load.image('houseInterior', 'assets/house.png');

        this.scene.load.audio('song1', 'assets/audio/stardew_valley_overture.m4a');
        this.scene.load.audio('song2', 'assets/audio/stardew_valley_spring.m4a');
    }

    create(player) {
        this.loadOutsideMap(player);

        // ------------------------
        // Music
        // ------------------------
        this.music = this.scene.sound.add('song1', { loop: true, volume: 0.5 });
        this.altMusic = this.scene.sound.add('song2', { loop: true, volume: 0.5 });
        this.music.play();

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
        // Input for enter/exit
        // ------------------------
        this.scene.input.keyboard.on('keydown-E', () => {
            if (!this.inHouse && this.scene.physics.overlap(player, this.houseZone)) {
                this.enterHouse(player);
            } else if (this.inHouse && this.scene.physics.overlap(player, this.doorZone)) {
                this.leaveHouse(player);
            }
        });

        // ------------------------
        // Floating prompt
        // ------------------------
        this.promptText = this.scene.add.text(0, 0, "", {
            font: "18px Arial",
            fill: "#fff",
            backgroundColor: "rgba(0,0,0,0.6)",
            padding: { x: 6, y: 3 }
        }).setOrigin(0.5).setVisible(false);

        this.scene.events.on("update", () => {
            if (!this.inHouse && this.scene.physics.overlap(player, this.houseZone)) {
                this.promptText.setText("Press E to Enter");
                this.promptText.setPosition(player.x, player.y - 60);
                this.promptText.setVisible(true);
            } else if (this.inHouse && this.scene.physics.overlap(player, this.doorZone)) {
                this.promptText.setText("Press E to Leave");
                this.promptText.setPosition(player.x, player.y - 60);
                this.promptText.setVisible(true);
            } else {
                this.promptText.setVisible(false);
            }
        });
    }

    loadOutsideMap(player) {
        if (this.map) this.map.destroy();

        this.map = this.scene.add.image(0, 0, 'worldMap').setOrigin(0, 0);

        // Scale to cover full screen (like before)
        const scaleX = this.scene.scale.width / this.map.width;
        const scaleY = this.scene.scale.height / this.map.height;
        const scale = Math.max(scaleX, scaleY);
        this.map.setScale(scale);

        const worldWidth = this.map.width * scale;
        const worldHeight = this.map.height * scale;
        this.scene.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        this.map.setDepth(-1);

        this.scene.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.scene.cameras.main.startFollow(player, true, 0.1, 0.1);

        // House trigger zone (adjusted for scale)
        const houseX = 230 * scale;
        const houseY = 250 * scale;
        const houseWidth = 53 * scale;
        const houseHeight = 105 * scale;

        this.houseZone = this.scene.add.zone(houseX, houseY, houseWidth, houseHeight)
            .setOrigin(0, 0);
        this.scene.physics.add.existing(this.houseZone);
        this.houseZone.body.setAllowGravity(false);
        this.houseZone.body.setImmovable(true);
    }

    enterHouse(player) {
        this.inHouse = true;

        this.scene.cameras.main.fadeOut(600, 0, 0, 0);
        this.scene.cameras.main.once('camerafadeoutcomplete', () => {
            this.map.destroy();
            if (this.houseZone) this.houseZone.destroy();

            // Add interior
            this.map = this.scene.add.image(this.scene.scale.width / 2, this.scene.scale.height / 2, 'houseInterior')
                .setOrigin(0.5);

            // Scale interior up but keep centered
            const scale = 3;
            this.map.setScale(scale);

            const worldWidth = this.map.width * scale;
            const worldHeight = this.map.height * scale;
            this.scene.physics.world.setBounds(0, 0, worldWidth, worldHeight);

            this.scene.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
            this.scene.cameras.main.startFollow(player, true, 0.1, 0.1);

            // Place Jot inside bottom center
            player.setPosition(worldWidth / 2, worldHeight - 120);

            // Door zone (bottom center)
            const doorX = worldWidth / 2 - 40;
            const doorY = worldHeight - 120;
            this.doorZone = this.scene.add.zone(doorX, doorY, 80, 40).setOrigin(0, 0);
            this.scene.physics.add.existing(this.doorZone);
            this.doorZone.body.setAllowGravity(false);
            this.doorZone.body.setImmovable(true);

            this.scene.cameras.main.fadeIn(600, 0, 0, 0);
        });
    }

    leaveHouse(player) {
        this.inHouse = false;

        // Walk-down animation
        this.scene.tweens.add({
            targets: player,
            y: player.y + 40,
            duration: 400,
            onComplete: () => {
                this.scene.cameras.main.fadeOut(600, 0, 0, 0);
                this.scene.cameras.main.once('camerafadeoutcomplete', () => {
                    this.map.destroy();
                    if (this.doorZone) this.doorZone.destroy();

                    this.loadOutsideMap(player);

                    // Place Jot just outside house
                    player.setPosition(260, 400);

                    this.scene.cameras.main.fadeIn(600, 0, 0, 0);
                });
            }
        });
    }
}
