export class WorldBuilder {
    constructor(scene, catalog) {
        this.scene = scene;
        this.catalog = catalog; // JSON object
        this.tileSize = 16;
        this.mapWidth = 100;   // tiles
        this.mapHeight = 100;  // tiles
        this.tileIndex = {};

        // quick lookup by name
        catalog.tiles.forEach(t => {
            this.tileIndex[t.name] = t.index;
        });
    }

    buildWorld() {
        const map = this.scene.make.tilemap({
            tileWidth: this.tileSize,
            tileHeight: this.tileSize,
            width: this.mapWidth,
            height: this.mapHeight
        });

        // Link the tilemap to your spritesheet
        const tileset = map.addTilesetImage('tiles', null, this.tileSize, this.tileSize, 1, 1);

        // Create a ground layer that actually uses the tiles
        const ground = map.createBlankLayer('Ground', tileset);

        // -------------------------
        // Fill base with grass
        // -------------------------
        ground.fill(this.tileIndex["grass"] ?? 0);

        // -------------------------
        // Add a pond
        // -------------------------
        for (let y = 40; y < 50; y++) {
            for (let x = 40; x < 50; x++) {
                ground.putTileAt(this.tileIndex["water"] ?? 0, x, y);
            }
        }

        // -------------------------
        // Add a dirt path
        // -------------------------
        for (let x = 0; x < this.mapWidth; x++) {
            ground.putTileAt(this.tileIndex["dirt"] ?? 0, x, 60);
        }
        for (let y = 30; y < this.mapHeight; y++) {
            ground.putTileAt(this.tileIndex["dirt"] ?? 0, 60, y);
        }

        // -------------------------
        // Sprinkle some trees
        // -------------------------
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, this.mapWidth - 1);
            const y = Phaser.Math.Between(0, this.mapHeight - 1);
            ground.putTileAt(this.tileIndex["tree"] ?? 0, x, y);
        }

        this.scene.cameras.main.setBounds(0, 0, this.mapWidth * this.tileSize, this.mapHeight * this.tileSize);
    }
}
