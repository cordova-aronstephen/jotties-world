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
    this.load.image('grass', 'assets/grass.png');

    // Load Jottie's spritesheet
    this.load.spritesheet('jottie', 'assets/jottie.png', {
        frameWidth: 384,
        frameHeight: 500
    });
}

function create() {
    // Add grass background
    this.add.tileSprite(400, 300, 800, 600, 'grass');

    // Add Jottie sprite
    player = this.physics.add.sprite(400, 300, 'jottie', 0);
    player.setScale(0.25); // adjust size
    player.setCollideWorldBounds(true);

    // Animations
    this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('jottie', { start: 0, end: 1 }),
        frameRate: 1, // very slow, just slight idle change
        repeat: -1
    });

    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('jottie', { start: 4, end: 7 }),
        frameRate: 5, // slower, smoother
        repeat: -1
    });

    // Enable input
    cursors = this.input.keyboard.createCursorKeys();

    // Start with idle animation
    player.anims.play('idle');
}

function update() {
    player.setVelocity(0);

    if (cursors.left.isDown) {
        player.setVelocityX(-120);
        player.setFlipX(true);
        player.anims.play('walk', true);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(120);
        player.setFlipX(false);
        player.anims.play('walk', true);
    }
    else if (cursors.up.isDown) {
        player.setVelocityY(-120);
        player.anims.play('walk', true);
    }
    else if (cursors.down.isDown) {
        player.setVelocityY(120);
        player.anims.play('walk', true);
    }
    else {
        player.anims.play('idle', true);
    }
}
