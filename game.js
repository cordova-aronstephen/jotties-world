const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: { default: 'arcade', arcade: { debug: false } },
    scene: { preload, create, update }
};

const game = new Phaser.Game(config);

let player;
let cursors;

function preload() {
    // Background
    this.load.image('grass', 'assets/grass.png');

    // Main spritesheet (idle + walk right/left)
    this.load.spritesheet('jottie', 'assets/jottie.png', {
        frameWidth: 384,
        frameHeight: 500
    });

    // Additional movements (walk up/down, turning)
    this.load.spritesheet('jottie1', 'assets/jottie_1.png', {
        frameWidth: 250, // 1000 / 4 columns
        frameHeight: 335 // 1005 / 3 rows approx
    });
}

function create() {
    // Background
    this.add.tileSprite(400, 300, 800, 600, 'grass');

    // Player sprite
    player = this.physics.add.sprite(400, 300, 'jottie', 0);
    player.setScale(0.25);
    player.setCollideWorldBounds(true);

    cursors = this.input.keyboard.createCursorKeys();

    // ------------------------
    // ANIMATIONS
    // ------------------------

    // --- Idle breathing (jottie row 0 frames 0-1) ---
    this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('jottie', { start: 0, end: 1 }),
        frameRate: 1,
        repeat: -1
    });

    // --- Walk right (jottie row 1 frames 0-3) ---
    this.anims.create({
        key: 'walk-right',
        frames: this.anims.generateFrameNumbers('jottie', { start: 4, end: 7 }),
        frameRate: 6,
        repeat: -1
    });

    // --- Walk left (same frames flipped) ---
    this.anims.create({
        key: 'walk-left',
        frames: this.anims.generateFrameNumbers('jottie', { start: 4, end: 7 }),
        frameRate: 6,
        repeat: -1
    });

    // --- Walk down (jottie_1 first row frames 0-2) ---
    this.anims.create({
        key: 'walk-down',
        frames: this.anims.generateFrameNumbers('jottie1', { start: 0, end: 2 }),
        frameRate: 6,
        repeat: -1
    });

    // --- Walk up (jottie_1 first + second row frames 3-8) ---
    this.anims.create({
        key: 'walk-up',
        frames: this.anims.generateFrameNumbers('jottie1', { start: 3, end: 8 }),
        frameRate: 6,
        repeat: -1
    });

    // --- Turning (jottie_1 third row frames 1-3) ---
    this.anims.create({
        key: 'turn',
        frames: this.anims.generateFrameNumbers('jottie1', { start: 9, end: 10 }),
        frameRate: 4,
        repeat: 0
    });

    // Start idle
    player.anims.play('idle');
}

function update() {
    let moving = false;
    player.setVelocity(0);

    // ------------------------
    // Horizontal movement
    // ------------------------
    if (cursors.left.isDown) {
        player.setVelocityX(-120);
        player.anims.play('walk-left', true);
        player.setFlipX(true); // flip for left
        player.setOrigin(0.5, 1);
        moving = true;
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(120);
        player.anims.play('walk-right', true);
        player.setFlipX(false); // normal for right
        player.setOrigin(0.5, 1);
        moving = true;
    }

    // ------------------------
    // Vertical movement
    // ------------------------
    if (cursors.up.isDown) {
        player.setVelocityY(-120);
        player.anims.play('walk-up', true);
        player.setOrigin(0.5, 1);
        moving = true;
    }
    else if (cursors.down.isDown) {
        player.setVelocityY(120);
        player.anims.play('walk-down', true);
        player.setOrigin(0.5, 1);
        moving = true;
    }

    // ------------------------
    // Idle
    // ------------------------
    if (!moving) {
        player.anims.play('idle', true);
        player.setOrigin(0.5, 1);
    }
}
