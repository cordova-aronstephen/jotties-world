// Basic Phaser config
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

let player;
let cursors;

function preload() {
  // Placeholder graphics (we can replace later with pixel art)
  this.load.image('background', 'https://labs.phaser.io/assets/skies/sky4.png');
  this.load.spritesheet('jottie', 'https://labs.phaser.io/assets/sprites/dude.png',
    { frameWidth: 32, frameHeight: 48 });
}

function create() {
  // Add background
  this.add.image(400, 300, 'background');

  // Add player
  player = this.physics.add.sprite(400, 300, 'jottie');
  player.setCollideWorldBounds(true);

  // Animations (walking)
  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('jottie', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: 'turn',
    frames: [{ key: 'jottie', frame: 4 }],
    frameRate: 20
  });
  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('jottie', { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
  });

  cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play('left', true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
    player.anims.play('right', true);
  } else {
    player.setVelocityX(0);
    player.anims.play('turn');
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-160);
  } else if (cursors.down.isDown) {
    player.setVelocityY(160);
  } else {
    player.setVelocityY(0);
  }
}
