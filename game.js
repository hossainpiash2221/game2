const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {
    this.load.image('player', 'assets/player.png');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.image('enemy', 'assets/enemy.png');
}

function create() {
    // Initialize score
    this.score = 0;
    
    // Create text for score display
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '32px',
        fill: '#fff'
    });

    // Create game over text (hidden initially)
    this.gameOverText = this.add.text(config.width / 2, config.height / 2, 'Game Over', {
        fontSize: '64px',
        fill: '#fff'
    }).setOrigin(0.5).setVisible(false);

    // Create player with smaller scale and circular body
    this.player = this.physics.add.sprite(400, 500, 'player').setScale(0.1);
    this.player.body.setCircle(this.player.width / 2);
    
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.bullets = this.physics.add.group({
        defaultKey: 'bullet',
        maxSize: 10
    });

    this.enemies = this.physics.add.group({
        defaultKey: 'enemy',
        maxSize: 10
    });

    this.time.addEvent({
        delay: 1000,
        callback: spawnEnemy,
        callbackScope: this,
        loop: true
    });

    this.physics.add.collider(this.bullets, this.enemies, hitEnemy, null, this);
}

function update() {
    if (this.cursors.left.isDown) {
        this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(200);
    } else {
        this.player.setVelocityX(0);
    }

    if (Phaser.Input.Keyboard.JustDown(this.spaceBar)) {
        shootBullet.call(this);
    }

    this.bullets.children.each(function(b) {
        if (b.active && b.y < 0) {
            b.setActive(false);
            b.setVisible(false);
        }
    }, this);

    // Check if any enemies go off-screen without being hit
    this.enemies.children.each(function(e) {
        if (e.active && e.y > 600) {
            gameOver.call(this);
        }
    }, this);
}

function shootBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setScale(0.05); // Scale down bullet
        bullet.body.setCircle(bullet.width / 2);
        bullet.body.velocity.y = -300;
    }
}

function spawnEnemy() {
    const enemy = this.enemies.get(Phaser.Math.Between(50, 750), 0);
    if (enemy) {
        enemy.setActive(true);
        enemy.setVisible(true);
        enemy.setScale(0.05); // Scale down enemy
        enemy.body.setCircle(enemy.width / 2);
        enemy.body.velocity.y = 100;
    }
}

function hitEnemy(bullet, enemy) {
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.setActive(false);
    enemy.setVisible(false);
    
    // Update score
    this.score += 1; // Increment score by 10 for each hit
    this.scoreText.setText('Score: ' + this.score);
}

function gameOver() {
    // Pause the game
    this.physics.pause();
    
    // Show game over text
    this.gameOverText.setVisible(true);

    // Stop spawning enemies
    this.time.removeAllEvents();

    // Deactivate all bullets and enemies
    this.bullets.children.each(function(b) {
        b.setActive(false);
        b.setVisible(false);
    });

    this.enemies.children.each(function(e) {
        e.setActive(false);
        e.setVisible(false);
    });
}
