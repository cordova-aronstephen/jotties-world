// world.js
export class WorldBuilder {
    constructor(scene) {
        this.scene = scene;
        this.map = null;

        this.music = null;     // Overture (outside)
        this.altMusic = null;  // Spring (inside)

        this.houseZone = null;
        this.doorZone = null;

        this.promptText = null;
        this.inHouse = false;
        this.debugDoorGraphics = null;
        this.doorPrompt = null;
    }

    preload() {
        this.scene.load.image('worldMap', 'assets/map.png');
        this.scene.load.image('houseInterior', 'assets/house.png');

        this.scene.load.audio('song1', 'assets/audio/stardew_valley_overture.m4a');
        this.scene.load.audio('song2', 'assets/audio/stardew_valley_spring.m4a');
    }

    create(player) {
        this.loadOutsideMap(player);

        // Create both tracks
        this.music = this.scene.sound.add('song1', { loop: true, volume: 0.5 });
        this.altMusic = this.scene.sound.add('song2', { loop: true, volume: 0.5 });

        // Start outside music
        this.music.play();

        // M key to manually toggle between songs
        this.scene.input.keyboard.on('keydown-M', () => {
            if (this.music.isPlaying) {
                this.music.stop();
                this.altMusic.play();
            } else if (this.altMusic.isPlaying) {
                this.altMusic.stop();
                this.music.play();
            }
        });

        // E key for enter/exit house
        this.scene.input.keyboard.on('keydown-E', () => {
            if (!this.inHouse && this.scene.physics.overlap(player, this.houseZone)) {
                this.enterHouse(player);
            } else if (this.inHouse && this.doorZone && this.scene.physics.overlap(player, this.doorZone)) {
                this.leaveHouse(player);
            }
        });

        // Floating prompt for outside
        this.promptText = this.scene.add.text(0, 0, "", {
            font: "18px Arial",
            fill: "#fff",
            backgroundColor: "rgba(0,0,0,0.6)",
            padding: { x: 6, y: 3 }
        }).setOrigin(0.5).setVisible(false);

        // Prompt updates
        this.scene.events.on("update", () => {
            if (!this.inHouse && this.scene.physics.overlap(player, this.houseZone)) {
                this.promptText.setText("Press E to Enter");
                this.promptText.setPosition(player.x, player.y - 80);
                this.promptText.setVisible(true);
            } else {
                this.promptText.setVisible(false);
            }

            if (this.inHouse && this.doorZone && this.doorPrompt) {
                this.doorPrompt.setVisible(this.scene.physics.overlap(player, this.doorZone));
            }
        });
    }

    loadOutsideMap(player) {
        if (this.map) this.map.destroy();

        this.map = this.scene.add.image(0, 0, 'worldMap').setOrigin(0, 0);

        const scaleX = this.scene.scale.width / this.map.width;
        const scaleY = this.scene.scale.height / this.map.height;
        const scale = Math.max(scaleX, scaleY);
        this.map.setScale(scale);
        this.map.setDepth(-1);

        const worldWidth = this.map.width * scale;
        const worldHeight = this.map.height * scale;
        this.scene.physics.world.setBounds(0, 0, worldWidth, worldHeight);
        this.scene.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.scene.cameras.main.startFollow(player, true, 0.1, 0.1);

        // House entrance zone
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

        // Music switch
        if (this.music.isPlaying) this.music.stop();
        if (!this.altMusic.isPlaying) this.altMusic.play();

        this.scene.cameras.main.fadeOut(600, 0, 0, 0);
        this.scene.cameras.main.once('camerafadeoutcomplete', () => {
            if (this.map) this.map.destroy();
            if (this.houseZone) this.houseZone.destroy();
            if (this.doorZone) this.doorZone.destroy();
            if (this.debugDoorGraphics) this.debugDoorGraphics.destroy();
            if (this.doorPrompt) this.doorPrompt.destroy();

            // Add house interior
            const scale = 3;
            const houseWidth = 918;
            const houseHeight = 515;

            this.map = this.scene.add.image(0, 0, 'houseInterior').setOrigin(0, 0);
            this.map.setScale(scale);
            this.map.setDepth(0);

            const mapScaledWidth = houseWidth * scale;
            const mapScaledHeight = houseHeight * scale;

            this.scene.physics.world.setBounds(0, 0, mapScaledWidth, mapScaledHeight);
            this.scene.cameras.main.setBounds(0, 0, mapScaledWidth, mapScaledHeight);
            this.scene.cameras.main.centerOn(mapScaledWidth / 2, mapScaledHeight / 2);

            // Player position inside
            player.setPosition(mapScaledWidth / 2, mapScaledHeight - 200);
            player.setOrigin(0.5, 1);
            player.setDepth(1);

            // Door zone
            const doorWidth = 80;
            const doorHeight = 40;
            const doorX = mapScaledWidth / 2 - doorWidth / 2;
            const doorY = mapScaledHeight - 180;
            this.doorZone = this.scene.add.zone(doorX, doorY, doorWidth, doorHeight).setOrigin(0, 0);
            this.scene.physics.add.existing(this.doorZone);
            this.doorZone.body.setAllowGravity(false);
            this.doorZone.body.setImmovable(true);

            // Debug rectangle
            this.debugDoorGraphics = this.scene.add.graphics();
            this.debugDoorGraphics.fillStyle(0xff0000, 0.3);
            this.debugDoorGraphics.fillRect(doorX, doorY, doorWidth, doorHeight);

            // Prompt above door
            this.doorPrompt = this.scene.add.text(doorX + doorWidth / 2, doorY - 10, "Press E to Leave", {
                font: "16px Arial",
                fill: "#fff",
                backgroundColor: "rgba(0,0,0,0.6)",
                padding: { x: 4, y: 2 }
            }).setOrigin(0.5, 1).setVisible(false);

            this.scene.cameras.main.fadeIn(600, 0, 0, 0);
        });
    }

    leaveHouse(player) {
        this.inHouse = false;

        // Music switch
        if (this.altMusic.isPlaying) this.altMusic.stop();
        if (!this.music.isPlaying) this.music.play();

        this.scene.tweens.add({
            targets: player,
            y: player.y + 40,
            duration: 400,
            onComplete: () => {
                this.scene.cameras.main.fadeOut(600, 0, 0, 0);
                this.scene.cameras.main.once('camerafadeoutcomplete', () => {
                    if (this.map) this.map.destroy();
                    if (this.doorZone) this.doorZone.destroy();
                    if (this.debugDoorGraphics) this.debugDoorGraphics.destroy();
                    if (this.doorPrompt) this.doorPrompt.destroy();

                    this.loadOutsideMap(player);

                    const outsideX = this.houseZone.x + this.houseZone.width / 2 - 70;
                    const outsideY = this.houseZone.y + this.houseZone.height + 50;
                    player.setPosition(outsideX, outsideY);

                    this.scene.cameras.main.fadeIn(600, 0, 0, 0);
                });
            }
        });
    }
}
