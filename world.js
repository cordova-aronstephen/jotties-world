// world.js
export class WorldBuilder {
    constructor(scene, config = {}) {
        this.scene = scene;
        this.width = config.width || 50;   // world width in tiles
        this.height = config.height || 38; // world height in tiles
        this.tileSize = config.tileSize || 16;
        this.tiles = [];
        this.map = [];
    }

    // Load the JSON catalog once
    async loadCatalog() {
        const response = await fetch("assets/tileset_catalog_described.json");
        const catalog = await response.json();
        return catalog;
    }

    async generateSmartMap() {
        const catalog = await this.loadCatalog();

        // Categorize tiles
        const grassTiles = catalog.filter(t => t.category === "grass");
        const flowerTiles = catalog.filter(t => t.category === "flower");
        const treeTiles = catalog.filter(t => t.category === "tree");
        const pathTiles = catalog.filter(t => t.category === "path");
        const waterTiles = catalog.filter(t => t.category === "water");

        // Helper to pick random tile from a category
        const randTile = arr => arr[Math.floor(Math.random() * arr.length)].id;

        // Build map
        for (let y = 0; y < this.height; y++) {
            let row = [];
            for (let x = 0; x < this.width; x++) {
                let tileId;

                if (Math.random() < 0.02) {
                    // sprinkle some water
                    tileId = randTile(waterTiles);
                } else if (Math.random() < 0.05) {
                    // sprinkle some flowers
                    tileId = randTile(flowerTiles);
                } else {
                    // default ground
                    tileId = randTile(grassTiles);
                }

                row.push(tileId);
            }
            this.map.push(row);
        }

        // Place some trees at edges
        for (let x = 0; x < this.width; x++) {
            this.map[0][x] = randTile(treeTiles);
            this.map[this.height - 1][x] = randTile(treeTiles);
        }
        for (let y = 0; y < this.height; y++) {
            this.map[y][0] = randTile(treeTiles);
            this.map[y][this.width - 1] = randTile(treeTiles);
        }

        console.log("Generated map (copy this and hardcode it):", this.map);
    }

    // Render the map into the scene
    renderMap(tilesetKey = "map") {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tileId = this.map[y][x];
                this.scene.add.image(
                    x * this.tileSize,
                    y * this.tileSize,
                    tilesetKey,
                    tileId
                ).setOrigin(0);
            }
        }
    }

    async buildWorld() {
        await this.generateSmartMap(); // Run once
        this.renderMap("map_1");       // Use your spritesheet
    }
}
