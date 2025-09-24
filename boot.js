// boot.js
export class BootScene extends Phaser.Scene {
    constructor() {
        super("BootScene");
    }

    preload() {
        // Load any assets needed for menu
        this.load.image("menuBg", "assets/menu_bg.png");
        this.load.image("button", "assets/button.png");
        this.load.image("buttonHover", "assets/button_hover.png");
    }

    create() {
        this.scene.start("MenuScene");
    }
}
