let player;
let cursors;

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: { debug: false },
  },
  scene: { preload, create, update },
};

new Phaser.Game(config);

function preload() {
  // Load your tileset
  this.load.spritesheet("tiles", "assets/roguelikeSheet_transparent.png", {
    frameWidth: 16,
    frameHeight: 16,
    margin: 1,
    spacing: 2, // fixes black grid issue
  });

  // Load a placeholder player sprite (Phaser's dude)
  this.load.spritesheet("dude", "https://labs.phaser.io/assets/sprites/dude.png", {
    frameWidth: 32,
    frameHeight: 48,
  });
}

function create() {
  // === TILE EXPLORER MODE ===
  const cols = 40; // number of tiles per row
  const totalTiles = this.textures.get("tiles").frameTotal;

  for (let i = 0; i < totalTiles; i++) {
    const x = (i % cols) * 20; // tile size * scale
    const y = Math.floor(i / cols) * 20 + 20;

    this.add.image(x, y, "tiles", i).setOrigin(0, 0).setScale(1.25);
    this.add.text(x, y + 16, i, { fontSize: "8px", fill: "#fff" });
  }

  // Camera setup
  this.cameras.main.setBounds(
    0,
    0,
    cols * 20,
    Math.ceil(totalTiles / cols) * 20
  );

  // Invisible target for following
  const camTarget = this.add.rectangle(0, 0, 1, 1, 0x000000, 0);
  this.cameras.main.startFollow(camTarget);

  // Camera controls with arrow keys
  this.input.keyboard.on("keydown-UP", () => {
    this.cameras.main.scrollY -= 40;
  });
  this.input.keyboard.on("keydown-DOWN", () => {
    this.cameras.main.scrollY += 40;
  });

  // === PLAYER (for later world mode) ===
  player = this.physics.add.sprite(100, 100, "dude");
  player.setCollideWorldBounds(true);

  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "turn",
    frames: [{ key: "dude", frame: 4 }],
    frameRate: 20,
  });

  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1,
  });

  cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  if (!cursors) return;

  if (cursors.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play("left", true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
    player.anims.play("right", true);
  } else {
    player.setVelocityX(0);
    player.anims.play("turn");
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-160);
  } else if (cursors.down.isDown) {
    player.setVelocityY(160);
  } else {
    player.setVelocityY(0);
  }
}
