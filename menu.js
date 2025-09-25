import { GameScene } from "./game.js";

export class MenuScene extends Phaser.Scene {
    constructor() {
        super("MenuScene");

        this.musicVolume = 0.5;
        this.gameVolume = 0.5;
        this.natureVolume = 0.5;

        this.muteMusic = false;
        this.muteGame = false;
        this.muteNature = false;
    }

    create() {
        this.add.image(this.scale.width / 2, this.scale.height / 2, "menuBg")
            .setDisplaySize(this.scale.width, this.scale.height);

        // Play menu music
        this.menuMusic = this.sound.add("menuMusic", { loop: true, volume: 0.5 });
        this.menuMusic.play();

        this.add.text(this.scale.width / 2, 100, "Jottie's World", {
            fontSize: "48px",
            color: "#fff"
        }).setOrigin(0.5);

        // Start Game
        this.createButton(this.scale.width / 2, 220, "Start Game", () => {
            this.menuMusic.stop();
            this.scene.add("GameScene", GameScene, false);
            this.scene.start("GameScene", {
                musicVolume: this.musicVolume,
                gameVolume: this.gameVolume,
                natureVolume: this.natureVolume,
                muteMusic: this.muteMusic,
                muteGame: this.muteGame,
                muteNature: this.muteNature
            });
        });

        this.add.text(this.scale.width / 2, 300, "Settings", {
            fontSize: "28px",
            color: "#fff"
        }).setOrigin(0.5);

        this.createVolumeControl("Music Volume", 360, v => this.musicVolume = v, () => this.muteMusic = !this.muteMusic);
        this.createVolumeControl("Game Volume", 420, v => this.gameVolume = v, () => this.muteGame = !this.muteGame);
        this.createVolumeControl("Nature Volume", 480, v => this.natureVolume = v, () => this.muteNature = !this.muteNature);

        this.add.text(this.scale.width / 2, 550,
            "Controls:\nArrow keys / WASD to move\nE = Interact\nM = Switch Music",
            { fontSize: "18px", color: "#fff", align: "center" }
        ).setOrigin(0.5);
    }

    createButton(x, y, label, callback) {
        const btn = this.add.image(x, y, "button").setInteractive().setOrigin(0.5).setScale(0.5);
        const txt = this.add.text(x, y, label, { fontSize: "20px", color: "#000" }).setOrigin(0.5);

        btn.on("pointerover", () => btn.setTexture("buttonHover"));
        btn.on("pointerout", () => btn.setTexture("button"));
        btn.on("pointerdown", callback);
    }

    createVolumeControl(label, y, onChange, onMute) {
        this.add.text(this.scale.width / 2 - 120, y, label, { fontSize: "18px", color: "#fff" }).setOrigin(0, 0.5);

        const minusBtn = this.add.text(this.scale.width / 2 + 50, y, "-", { fontSize: "24px", color: "#fff" }).setInteractive();
        const plusBtn = this.add.text(this.scale.width / 2 + 100, y, "+", { fontSize: "24px", color: "#fff" }).setInteractive();
        const muteBtn = this.add.text(this.scale.width / 2 + 150, y, "Mute", { fontSize: "18px", color: "#f88" }).setInteractive();

        let current = 0.5;
        const updateVolume = () => onChange(current);

        minusBtn.on("pointerdown", () => { current = Math.max(0, current - 0.1); updateVolume(); });
        plusBtn.on("pointerdown", () => { current = Math.min(1, current + 0.1); updateVolume(); });
        muteBtn.on("pointerdown", onMute);
    }
}
