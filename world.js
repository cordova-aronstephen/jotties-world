// world.js
export class WorldBuilder {
    constructor(scene) {
        this.scene = scene;
    }

    preload() {
        // Load your premade map image
        this.scene.load.image('worldMap', 'assets/map.png'); // change filename if needed
    }

    create(player) {
        // Add the map background centered
        const map = this.scene.add.image(0, 0, 'worldMap').setOrigin(0, 0);

        // Set world bounds to match the map size
        this.scene.physics.world.setBounds(0, 0, map.width, map.height);

        // Camera follows player smoothly
        this.scene.cameras.main.setBounds(0, 0, map.width, map.height);
        this.scene.cameras.main.startFollow(player, true, 0.1, 0.1);
    }
}
