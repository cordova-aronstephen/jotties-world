// boot.js
export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
        this._keyHandler = null; // store handler so we can remove it later
    }

    preload() {
        // assets used on boot/title
        this.load.image('bootBg', 'assets/boot_bg.png');
        this.load.audio('bootMusic', 'assets/audio/stardew_valley_loadgame.m4a');
    }

    create() {
        const { width, height } = this.scale;

        // background (stretched to fill)
        this.add.image(width / 2, height / 2, 'bootBg')
            .setOrigin(0.5)
            .setDisplaySize(width, height);

        // prepare boot music (don't play yet)
        this.bootMusic = this.sound.add('bootMusic', { loop: true, volume: 0.5 });

        // title panel
        const panelW = Math.min(1000, width * 0.7);
        const panelH = Math.min(420, height * 0.45);
        const panelX = width / 2;
        const panelY = height / 2;
        this.add.rectangle(panelX, panelY, panelW, panelH, 0x000000, 0.6).setStrokeStyle(4, 0xffffff, 0.9);

        // big title
        this.add.text(panelX, panelY - panelH/2 + 50, "Jottie's World", {
            font: "56px Georgia",
            fill: "#fff",
            stroke: "#000",
            strokeThickness: 6
        }).setOrigin(0.5);

        // small instruction / status text area
        this.status = this.add.text(panelX, panelY - 10, "", {
            font: "24px Arial",
            fill: "#ffffaa",
            align: "center",
            wordWrap: { width: panelW - 60 }
        }).setOrigin(0.5);

        // masked password display
        this.passwordDisplay = this.add.text(panelX, panelY + 30, "", {
            font: "28px Courier",
            fill: "#fff"
        }).setOrigin(0.5);

        // feedback (errors)
        this.feedback = this.add.text(panelX, panelY + 80, "", {
            font: "20px Arial",
            fill: "#ff6b6b"
        }).setOrigin(0.5);

        // Start / Logout buttons (created but hidden initially)
        this.startButton = this.add.text(panelX, panelY + 140, "Start Game", {
            font: "30px Arial",
            fill: "#ffffaa",
            backgroundColor: "#344",
            padding: { x: 14, y: 8 },
            align: "center"
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setVisible(false);

        this.logoutButton = this.add.text(panelX, panelY + 190, "Log Out", {
            font: "20px Arial",
            fill: "#ffaaaa",
            backgroundColor: "#331",
            padding: { x: 10, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setVisible(false);

        this.startButton.on('pointerover', () => this.startButton.setStyle({ fill: "#fff" }));
        this.startButton.on('pointerout', () => this.startButton.setStyle({ fill: "#ffffaa" }));
        this.startButton.on('pointerdown', () => {
            if (this.bootMusic && this.bootMusic.isPlaying) this.bootMusic.stop();
            this.scene.start('MainScene');
        });

        this.logoutButton.on('pointerdown', () => {
            localStorage.removeItem('jottieLoggedIn');
            // reset UI to ask for password again
            this._teardownKeyHandler();
            this._resetToPasswordMode();
        });

        // decide whether to ask for password or skip (if previously logged in)
        const saved = localStorage.getItem('jottieLoggedIn') === 'true';
        if (saved) {
            // already logged in previously — show start + logout, attempt to play music
            this.status.setText("Welcome back, Jottie!");
            this.passwordDisplay.setText("");
            this._showStartAndLogout(true);
        } else {
            // show instructions and start listening for typed password
            this._resetToPasswordMode();
        }
    }

    // Put scene into password-entry mode
    _resetToPasswordMode() {
        this.status.setText("Please type the password and press ENTER");
        this.passwordDisplay.setText("");
        this.feedback.setText("");
        this.entered = "";
        this.startButton.setVisible(false);
        this.logoutButton.setVisible(false);

        // attach keyboard handler (remove previous first if any)
        this._teardownKeyHandler();
        this._keyHandler = (event) => this._onKey(event);
        this.input.keyboard.on('keydown', this._keyHandler);
    }

    _teardownKeyHandler() {
        if (this._keyHandler) {
            this.input.keyboard.off('keydown', this._keyHandler);
            this._keyHandler = null;
        }
    }

    // centralized key handling while entering password
    _onKey(event) {
        const key = event.key;

        // ignore modifier keys
        if (event.ctrlKey || event.altKey || event.metaKey) return;

        if (key === 'Backspace') {
            this.entered = this.entered.slice(0, -1);
        } else if (key === 'Enter') {
            this._submitPassword();
            return;
        } else if (key.length === 1) {
            // add printable character
            // optional: restrict to ASCII printable:
            if (key.charCodeAt(0) >= 32 && key.charCodeAt(0) <= 126) {
                this.entered += key;
            }
        } else {
            // ignore other keys (Arrow, Tab, etc.)
            return;
        }

        // update masked display
        this.passwordDisplay.setText('*'.repeat(this.entered.length));
    }

    _submitPassword() {
        const attempt = this.entered ?? "";
        const CORRECT = "jottie"; // change password here if needed

        if (attempt === CORRECT) {
            // success
            this.feedback.setText("");
            localStorage.setItem('jottieLoggedIn', 'true');

            // user typed -> user gesture for autoplay; attempt to play boot music
            if (this.bootMusic && !this.bootMusic.isPlaying) {
                try { this.bootMusic.play(); } catch (e) { /* autoplay blocked; will play on user gesture later */ }
            }

            this.status.setText("Access granted. Welcome!");
            this._teardownKeyHandler();

            // small delay then show Start
            this.time.delayedCall(600, () => {
                this._showStartAndLogout(true);
            });
        } else {
            // failed
            this.feedback.setText("Wrong password — try again.");
            this.entered = "";
            this.passwordDisplay.setText("");
        }
    }

    _showStartAndLogout(playMusic = false) {
        this.passwordDisplay.setText("");
        this.startButton.setVisible(true);
        this.logoutButton.setVisible(true);
        this.status.setText("Press Start to enter the world");

        if (playMusic && this.bootMusic && !this.bootMusic.isPlaying) {
            try { this.bootMusic.play(); } catch (e) { /* swallow autoplay issues */ }
        }
    }

    // ensure we clean up listeners if this scene is stopped
    shutdown() {
        this._teardownKeyHandler();
    }

    // Phaser calls this when the scene is shutdown or destroyed
    destroy() {
        this._teardownKeyHandler();
        super.destroy && super.destroy();
    }
}
