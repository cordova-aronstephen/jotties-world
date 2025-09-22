export class WorldBuilder {
    constructor(scene) {
        this.scene = scene;
        this.tileSize = 16;
        this.width = 100 * this.tileSize;   // bigger world
        this.height = 100 * this.tileSize;
        this.ground = null;
    }

    buildWorld() {
        const mapWidth = 100;
        const mapHeight = 100;

        // create tilemap
        const map = this.scene.make.tilemap({
            tileWidth: this.tileSize,
            tileHeight: this.tileSize,
            width: mapWidth,
            height: mapHeight
        });

        const tileset = map.addTilesetImage('tiles', null, this.tileSize, this.tileSize, 1, 1);

        this.ground = map.createBlankLayer('Ground', tileset);

        // fill with grass (id ~0, adjust to your JSON later)
        this.ground.fill(5);

        // simple pond
        for (let y = 40; y < 50; y++) {
            for (let x = 40; x < 50; x++) {
                this.ground.putTileAt(20, x, y); // water tile id
            }
        }

        // dirt path
        for (let x = 0; x < mapWidth; x++) {
            this.ground.putTileAt(10, x, 60); // horizontal path
        }

        for (let y = 30; y < mapHeight; y++) {
            this.ground.putTileAt(10, 60, y); // vertical path
        }

        // scatter trees
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, mapWidth - 1);
            const y = Phaser.Math.Between(0, mapHeight - 1);
            this.ground.putTileAt(35, x, y); // tree tile id
        }
    }
}
