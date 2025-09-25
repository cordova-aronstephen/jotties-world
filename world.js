// world.js
export class WorldBuilder {
    constructor(scene) {
        this.scene = scene;
        this.map = null;

        this.music = null;
        this.altMusic = null;

        this.houseZone = null;
        this.doorZone = null;

        this.promptText = null;
        this.leaveText = null;              // static text inside red debug rect
        this.inHouse = false;
        this.debugDoorGraphics = null;      // debug overlay for door

        // overlap state guards to avoid console spamming
        this._overlappingHouse = false;
        this._overlappingDoor = false;
    }

    preload() {
        // images
        this.scene.load.image('worldMap', 'assets/map.png');
        this.scene.load.image('houseInterior', 'assets/house.png');

        // music
        this.scene.load.audio('song1', 'assets/audio/stardew_valley_overture.m4a');
        this.scene.load.audio('song2', 'assets/audio/stardew_valley_spring.m4a');

        // (optional) nature sounds if you want them later
        this.scene.load.audio('birds', 'assets/audio/birds.m4a');
        this.scene.load.audio('water', 'assets/audio/water.m4a');
    }

    create(player) {
        this.loadOutsideMap(player);

        // Music (these assets were queued in preload())
        this.music = this.scene.sound.add('song1', { loop: true, volume: 0.5 });
        this.altMusic = this.scene.sound.add('song2', { loop: true, volume: 0.5 });
        if (this.music) this.music.play();

        // switch music with M
        this.scene.input.keyboard.on('keydown-M', () => {
            if (this.music && this.music.isPlaying) {
                this.music.stop();
                if (this.altMusic) this.altMusic.play();
            } else if (this.altMusic && this.altMusic.isPlaying) {
                this.altMusic.stop();
                if (this.music) this.music.play();
            }
        });

        // Enter / exit (E): uses overlap checks
        this.scene.input.keyboard.on('keydown-E', () => {
            if (!this.inHouse && this.houseZone && this.scene.physics.overlap(player, this.houseZone)) {
                this.enterHouse(player);
            } else if (this.inHouse && this.doorZone && this.scene.physics.overlap(player, this.doorZone)) {
                this.leaveHouse(player);
            }
        });

        // Floating prompt (follows sprite)
        this.promptText = this.scene.add.text(0, 0, "", {
            font: "18px Arial",
            fill: "#fff",
            backgroundColor: "rgba(0,0,0,0.6)",
            padding: { x: 6, y: 3 }
        }).setOrigin(0.5).setVisible(false);

        // Update loop: manage prompt + leaveText visibility and debug logs once-per-enter
        this.scene.events.on("update", () => {
            // outside house "Press E to Enter"
            const overHouse = (!this.inHouse && this.houseZone && this.scene.physics.overlap(player, this.houseZone));
            if (overHouse) {
                this.promptText.setText("Press E to Enter");
                this.promptText.setPosition(player.x, player.y - 80);
                this.promptText.setVisible(true);
                if (!this._overlappingHouse) {
                    console.log("Entered house overlap");
                    this._overlappingHouse = true;
                }
            } else {
                this._overlappingHouse = false;
            }

            // inside house "Press E to Leave" and static leaveText inside rectangle
            const overDoor = (this.inHouse && this.doorZone && this.scene.physics.overlap(player, this.doorZone));
            if (overDoor) {
                this.promptText.setText("Press E to Leave");
                this.promptText.setPosition(player.x, player.y - 80);
                this.promptText.setVisible(true);

                // show leaveText (static text placed over the red box)
                if (this.leaveText) this.leaveText.setVisible(true);

                if (!this._overlappingDoor) {
                    console.log("Player overlapping doorZone");
                    this._overlappingDoor = true;
                }
            } else {
                if (this.leaveText) this.leaveText.setVisible(false);
                this._overlappingDoor = false;
                // hide prompt if not overlapping anything
                if (!overHouse) this.promptText.setVisible(false);
            }
        });
    }

    loadOutsideMap(player) {
        if (this.map) this.map.destroy();

        this.map = this.scene.add.image(0, 0, 'worldMap').setOrigin(0, 0);
        this.map.setDepth(-1);

        const scaleX = this.scene.scale.width / this.map.width;
        const scaleY = this.scene.scale.height / this.map.height;
        const scale = Math.max(scaleX, scaleY);
        this.map.setScale(scale);

        const worldWidth = this.map.width * scale;
        const worldHeight = this.map.height * scale;
        this.scene.physics.world.setBounds(0, 0, worldWidth, worldHeight);
        this.scene.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.scene.cameras.main.startFollow(player, true, 0.1, 0.1);

        // House trigger zone (outside)
        const houseX = 230 * scale;
        const houseY = 250 * scale;
        const houseWidth = 53 * scale;
        const houseHeight = 105 * scale;

        this.houseZone = this.scene.add.zone(houseX, houseY, houseWidth, houseHeight).setOrigin(0, 0);
        this.scene.physics.add.existing(this.houseZone);
        this.houseZone.body.setAllowGravity(false);
        this.houseZone.body.setImmovable(true);
    }

    enterHouse(player) {
        this.inHouse = true;

        this.scene.cameras.main.fadeOut(400, 0, 0, 0);
        this.scene.cameras.main.once('camerafadeoutcomplete', () => {
            // cleanup outside zones/graphics
            if (this.map) this.map.destroy();
            if (this.houseZone) { this.houseZone.destroy(); this.houseZone = null; }
            if (this.doorZone) { this.doorZone.destroy(); this.doorZone = null; }
            if (this.debugDoorGraphics) { this.debugDoorGraphics.destroy(); this.debugDoorGraphics = null; }
            if (this.leaveText) { this.leaveText.destroy(); this.leaveText = null; }

            // Add house interior
            const houseKey = 'houseInterior';
            const scale = 3;
            const houseWidth = 918;
            const houseHeight = 515;

            this.map = this.scene.add.image(0, 0, houseKey).setOrigin(0, 0);
            this.map.setScale(scale);
            this.map.setDepth(-1);

            const mapScaledWidth = houseWidth * scale;
            const mapScaledHeight = houseHeight * scale;

            this.scene.physics.world.setBounds(0, 0, mapScaledWidth, mapScaledHeight);
            this.scene.cameras.main.setBounds(0, 0, mapScaledWidth, mapScaledHeight);
            // keep camera following the player inside too:
            this.scene.cameras.main.startFollow(player, true, 0.1, 0.1);

            // Player inside house (spawn a bit higher)
            player.setOrigin(0.5, 1);
            player.setPosition(mapScaledWidth / 2, mapScaledHeight - 200);
            player.setDepth(1);
            player.setCollideWorldBounds(true);

            // Door zone (raised up so it's reachable and visible)
            const doorWidth = 80;
            const doorHeight = 40;
            const doorX = Math.round(mapScaledWidth / 2 - doorWidth / 2);
            const doorY = Math.round(mapScaledHeight - 180); // raised
            this.doorZone = this.scene.add.zone(doorX, doorY, doorWidth, doorHeight).setOrigin(0, 0);
            this.scene.physics.add.existing(this.doorZone);
            this.doorZone.body.setAllowGravity(false);
            this.doorZone.body.setImmovable(true);

            // Debug red rectangle so you see the zone
            this.debugDoorGraphics = this.scene.add.graphics();
            this.debugDoorGraphics.fillStyle(0xff0000, 0.25);
            this.debugDoorGraphics.fillRect(doorX, doorY, doorWidth, doorHeight);

            // "Press E to Leave" static text centered over the red rect (hidden until overlap)
            this.leaveText = this.scene.add.text(doorX + doorWidth / 2, doorY - 8, "Press E to Leave", {
                font: "16px Arial",
                fill: "#ffff66",
                backgroundColor: "rgba(0,0,0,0.6)",
                padding: { x: 6, y: 4 }
            }).setOrigin(0.5, 1).setDepth(2).setVisible(false);

            this.scene.cameras.main.fadeIn(400, 0, 0, 0);
        });
    }

    leaveHouse(player) {
        this.inHouse = false;

        // small step animation then fade out -> back outside
        this.scene.tweens.add({
            targets: player,
            y: player.y + 40,
            duration: 300,
            onComplete: () => {
                this.scene.cameras.main.fadeOut(400, 0, 0, 0);
                this.scene.cameras.main.once('camerafadeoutcomplete', () => {
                    if (this.map) this.map.destroy();
                    if (this.doorZone) { this.doorZone.destroy(); this.doorZone = null; }
                    if (this.debugDoorGraphics) { this.debugDoorGraphics.destroy(); this.debugDoorGraphics = null; }
                    if (this.leaveText) { this.leaveText.destroy(); this.leaveText = null; }

                    // reload the outside map and zones
                    this.loadOutsideMap(player);

                    // Place player further left + further down outside for natural exit
                    // Make sure houseZone exists (it was just recreated in loadOutsideMap)
                    if (this.houseZone) {
                        const outsideX = this.houseZone.x + this.houseZone.width / 2 - 90; // more left
                        const outsideY = this.houseZone.y + this.houseZone.height + 80;    // more down
                        player.setOrigin(0.5, 1);
                        player.setPosition(outsideX, outsideY);
                    }

                    this.scene.cameras.main.fadeIn(400, 0, 0, 0);
                });
            }
        });
    }
}
