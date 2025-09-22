const config = {
    type: Phaser.AUTO,
    width: 2500,
    height: 1700,
    physics: { default: 'arcade', arcade: { debug: false } },
    scene: { preload, create, update }
};

const game = new Phaser.Game(config);

let player;
let cursors;
let lastDirection = 'down';
const BASE_SCALE = 0.25;
const SPEED = 180;

// Frame heights for dynamic scaling
const FRAME_HEIGHTS = {
    jottie: 500,   // horizontal + idle
    jottie1: 335   // vertical walking
};

// Breathing tween
let breathTween = null;
let backBreathTween = null;

function preload() {
    // Horizontal + idle + turn
    this.load.spritesheet('jottie', 'assets/jottie.png', { frameWidth: 384, frameHeight: 500 });

    // Vertical walking
    this.load.spritesheet('jottie1', 'assets/jottie_1.png', { frameWidth: 250, frameHeight: 335 });
}

function create() {
    // Player starting idle front
    player = this.physics.add.sprite(1250, 700, 'jottie', 1);
    setDynamicScale('jottie');
    player.setCollideWorldBounds(true);
    player.setOrigin(0.5, 1);

    cursors = this.input.keyboard.createCursorKeys();

    // ------------------------
    // Animations
    // ------------------------
    this.anims.create({ key: 'idle-front', frames: [ { key: 'jottie', frame: 1 } ], frameRate: 1, repeat: -1 });
    this.anims.create({ key: 'idle-back', frames: [ { key: 'jottie', frame: 3 } ], frameRate: 1, repeat: -1 });

    this.anims.create({ key: 'walk-right', frames: this.anims.generateFrameNumbers('jottie', { start: 5, end: 9 }), frameRate: 8, repeat: -1 });
    this.anims.create({ key: 'walk-left', frames: this.anims.generateFrameNumbers('jottie', { start: 5, end: 9 }), frameRate: 8, repeat: -1 });

    this.anims.create({ key: 'walk-up', frames: this.anims.generateFrameNumbers('jottie1', { start: 3, end: 8 }), frameRate: 8, repeat: -1 });
    this.anims.create({ key: 'walk-down', frames: this.anims.generateFrameNumbers('jottie1', { start: 0, end: 2 }), frameRate: 8, repeat: -1 });

    player.anims.play('idle-front');

    // ------------------------
    // Breathing tween (front idle)
    // ------------------------
    breathTween = this.tweens.add({
        targets: player,
        scaleX: `+=0.02`,
        scaleY: `-=0.02`,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        paused: true
    });

    backBreathTween = this.tweens.add({
        targets: player,
        scaleX: `+=0.01`,
        scaleY: `-=0.01`,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        paused: true
    });
}

function update() {
    let moving = false;
    player.setVelocity(0);

    const up = cursors.up.isDown;
    const down = cursors.down.isDown;
    const left = cursors.left.isDown;
    const right = cursors.right.isDown;

    // ------------------------
    // Determine primary facing direction
    // ------------------------
    if (up || down) {
        lastDirection = up ? 'up' : 'down';
    } else if (left || right) {
        lastDirection = left ? 'left' : 'right';
    }

    // ------------------------
    // Vertical priority (diagonal uses vertical frames)
    // ------------------------
    if (up) {
        player.setVelocityY(-SPEED);
        if (left) player.setVelocityX(-SPEED);
        else if (right) player.setVelocityX(SPEED);

        player.anims.play('walk-up', true);
        setDynamicScale('jottie1');
        player.setOrigin(0.5, 1);
        moving = true;

    } else if (down) {
        player.setVelocityY(SPEED);
        if (left) player.setVelocityX(-SPEED);
        else if (right) player.setVelocityX(SPEED);

        player.anims.play('walk-down', true);
        setDynamicScale('jottie1');
        player.setOrigin(0.5, 1);
        moving = true;

    } else if (left) {
        player.setVelocityX(-SPEED);
        player.anims.play('walk-left', true);
        player.setFlipX(true);
        setDynamicScale('jottie');
        player.setOrigin(0.5, 1);
        moving = true;

    } else if (right) {
        player.setVelocityX(SPEED);
        player.anims.play('walk-right', true);
        player.setFlipX(false);
        setDynamicScale('jottie');
        player.setOrigin(0.5, 1);
        moving = true;
    }

    // ------------------------
    // Idle handling
    // ------------------------
    if (!moving) {
        switch (lastDirection) {
            case 'up':
                player.anims.play('idle-back', true);
                setDynamicScale('jottie');
                breathTween.pause();
                if (!backBreathTween.isPlaying()) backBreathTween.resume();
                break;
            case 'down':
            case 'left':
            case 'right':
                player.anims.play('idle-front', true);
                setDynamicScale('jottie');
                backBreathTween.pause();
                if (!breathTween.isPlaying()) breathTween.resume();
                break;
        }
    } else {
        breathTween.pause();
        backBreathTween.pause();
    }
}

// ------------------------
// Helper: scale vertical frames to match horizontal visual size
// ------------------------
function setDynamicScale(sheetKey) {
    if (sheetKey === 'jottie1') {
        const desiredHeight = FRAME_HEIGHTS.jottie; // 500
        const frameHeight = FRAME_HEIGHTS.jottie1;  // 335
        const scale = BASE_SCALE * (desiredHeight / frameHeight); // match horizontal size
        player.setScale(scale);
    } else {
        player.setScale(BASE_SCALE);
    }
}
