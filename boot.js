import { MenuScene } from "./menu.js";

export class BootScene extends Phaser.Scene {
    constructor() {
        super("BootScene");
    }

    preload() {
        // Background & dummy buttons
        this.load.image("menuBg", "assets/map.png");
        this.load.image("button", "assets/jottie_1.png");
        this.load.image("buttonHover", "assets/jottie.png");

        // Menu music
        this.load.audio("menuMusic", "assets/audio/stardew_valley_loadgame.m4a");
    }

    create() {
        this.scene.add("MenuScene", MenuScene, false);
        this.scene.start("MenuScene");
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: "#000",
    physics: {
        default: "arcade",
        arcade: { debug: false }
    },
    scene: [BootScene]
};

new Phaser.Game(config);
