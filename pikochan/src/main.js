var Preload = function() {};
Preload.prototype = {
  init: function() {
    if (localStorage.getItem('playerBestScore') === null) {
      localStorage.setItem('playerBestScore', 0);
    }
  },
  preload: function() {
    this.game.load.image('font', 'asset/retrofont.png');
  },
  create: function() {
    this.game.stage.backgroundColor = '#191919';

    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.scale.refresh();

    this.game.scale.pageAlignHorizontally = true;
    this.game.scale.pageAlignVertically = true;

    this.game.stage.smoothed = false;

    PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST; //for WebGL

    var messageText = this.game.add.retroFont('font', 8, 8, '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ', 58, 0, 0);
    messageText.text = 'loading...';
    var messagePicture = this.game.add.image(this.game.world.centerX, this.game.world.centerY, messageText);
    messagePicture.anchor.set(0.5);

    this.game.state.start('Load', false);
  }
};

var Load = function() {};
Load.prototype = {
  preload: function() {
    this.game.load.audio('bgm', 'asset/bgm.ogg')

    this.game.load.spritesheet('sheet', 'asset/sheet.png', 16, 16);
    this.game.load.image('logo', 'asset/logo.png');
  },
  create: function() {
    var bgm = this.game.add.audio('bgm', 0.8, true);
    bgm.play();

    this.game.state.start('TitleScreen');
  }
};

var TitleScreen = function() {};
TitleScreen.prototype = {
  create: function() {
    var logo = this.game.add.image(this.game.world.centerX, this.game.world.centerY - 32, 'logo');
    logo.anchor.set(0.5);

    var messages = ['piko-chan',
                    'click/tap to begin',
                    'your best score is ' + localStorage.getItem('playerBestScore'),
                    '(c) daniel savage 2015'];

    for (var i = 0; i < messages.length; i++) {
      var messageText = this.game.add.retroFont('font', 8, 8, '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ', 58, 0, 0);
      messageText.text = messages[i];
      var messagePicture = this.game.add.image(this.game.world.centerX, this.game.world.centerY + 16 * i, messageText);
      messagePicture.anchor.set(0.5);

      if (i == messages.length - 1) {
        messagePicture.x = this.game.width - 2;
        messagePicture.y = this.game.height - 2;
        messagePicture.anchor.set(1);
      }
    }
    
    this.game.add.sprite(this.game.width / 8, this.game.height / 4, 'sheet', 0);
    this.game.add.sprite(this.game.width / 8 * 7, this.game.height / 4 + this.game.height / 8, 'sheet', 3).scale.x = -1;

    this.game.input.onTap.add(function() {
      this.game.input.onTap.removeAll();
      this.game.state.start('Gameplay');
    }, this);
  }
};

var Gameplay = function() {};
Gameplay.prototype = {
  timeAlive: 0,

  player: null,
  playerFlySpeed: 60,
  playerChargeTime: 1,

  playerEmitter: null,

  obstacles: null,
  obstacleSpawnTimer: null,
  obstacleSpawnInterval: 1000,
  obstacleSpeed: 40,

  pointerDown: null,
  pointerDownTime: -1,

  timeText: null,
  timeTextPicture: null,

  gameOverText: null,
  gameOverTextPicture: null,
  tapToContinueText: null,
  tapToContinueTextPicture: null,

  spawnNewObstacle: function() {
    var newObstacle = this.obstacles.getFirstDead();
    newObstacle.revive();
    newObstacle.x = this.game.width;
    newObstacle.y = Math.random() * this.game.height;
    newObstacle.body.velocity.x = -1 * this.obstacleSpeed;
  },

  preload: function() {
    //
  },

  create: function() {
    this.timeAlive = 0;

    this.topBG = this.game.add.tileSprite(0, 0, this.game.width, 16, 'sheet', 25);
    this.bottomBG = this.game.add.tileSprite(0, this.game.height - 16, this.game.width, 16, 'sheet', 24);

    this.timeText = this.game.add.retroFont('font', 8, 8, '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ', 58, 0, 0);
    this.timeText.text = 'ABCDEFG';

    this.timeTextPicture = this.game.add.image(this.game.world.centerX, 18, this.timeText);
    this.timeTextPicture.anchor.set(0.5, 0);

    this.player = this.game.add.sprite(50, this.game.height / 2, 'sheet', 0);
    this.player.animations.add('flap_down', [0, 1], 6, true);
    this.player.animations.add('flap_up', [2, 3], 6, true);
    this.game.physics.arcade.enable(this.player);
    this.player.body.setSize(12, 12);
    this.player.body.bounce.setTo(0.7);
    this.player.body.collideWorldBounds = true;
    this.player.anchor.setTo(0.5);
    this.player.body.gravity.y = 20;

    this.playerEmitter = this.game.add.emitter(0, 0, 30);
    this.playerEmitter.makeParticles('sheet', [9, 10, 11]);
    this.playerEmitter.setXSpeed(-20, -10);
    this.playerEmitter.setYSpeed(10, 26);
    this.playerEmitter.minRotation = 0;
    this.playerEmitter.maxRotation = 0;
    this.playerEmitter.flow(200, 500);

    this.obstacles = this.game.add.group();
    for (var i = 0; i < 32; i++) {
      var newObstacle = this.game.add.sprite(8, 8, 'sheet', 19 + ~~(Math.random() * 5));
      newObstacle.x = -1000;
      newObstacle.y = -1000;
      this.game.physics.arcade.enable(newObstacle);
      newObstacle.body.setSize(16, 16);
      newObstacle.kill();

      this.obstacles.add(newObstacle);
    }
    this.obstacleSpawnTimer = this.game.time.events.loop(this.obstacleSpawnInterval, this.spawnNewObstacle, this);

    // controls setup
    this.game.input.maxPointers = 1;
    this.game.input.onDown.add(function(pointer) {
      if (this.player.alive === false) {
        return;
      }

      this.pointerDown = pointer;
      this.pointerDownTime = 0;
    }, this);
    this.game.input.onUp.add(function(pointer) {
      if (pointer === this.pointerDown) {

        var deltaX = pointer.x - this.player.x;
        var deltaY = pointer.y - this.player.y;

        var angle = Math.atan2(deltaY, deltaX);

        var flyVelocity = this.pointerDownTime > this.playerChargeTime ? this.playerFlySpeed : ((this.pointerDownTime / this.playerChargeTime * 0.7 + 0.3) * this.playerFlySpeed);

        this.player.body.velocity.setTo(Math.cos(angle) * flyVelocity, Math.sin(angle) * flyVelocity);

        this.pointerDown = null;
        this.pointerDownTime = -1;
      }
    }, this);

    this.gameOverText = this.game.add.retroFont('font', 8, 8, '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ', 58, 0, 0);
    this.gameOverText.text = 'GAME OVER';
    this.gameOverTextPicture = this.game.add.image(this.game.world.centerX, this.game.world.centerY, this.gameOverText);
    this.gameOverTextPicture.anchor.set(0.5);
    this.gameOverTextPicture.visible = false;

    this.tapToContinueText = this.game.add.retroFont('font', 8, 8, '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ', 58, 0, 0);
    this.tapToContinueText.text = 'tap/click to continue';
    this.tapToContinueTextPicture = this.game.add.image(this.game.world.centerX, this.game.world.centerY + 16, this.tapToContinueText);
    this.tapToContinueTextPicture.anchor.set(0.5);
    this.tapToContinueTextPicture.visible = false;

    this.game.world.bringToTop(this.gameOverText);
  },

  update: function() {
    if (this.pointerDownTime !== -1) {
      this.pointerDownTime += this.game.time.physicsElapsed;
    }

    this.playerEmitter.position.setTo(this.player.x - 4, this.player.y - 4);

    this.timeAlive += this.player.alive ? this.game.time.physicsElapsed : 0;

    this.topBG.tilePosition.x += this.player.alive ? -0.75 : 0;
    this.bottomBG.tilePosition.x += this.player.alive ? -0.75 : 0;

    this.obstacles.forEachAlive(function(obstacle) {
      if (obstacle.x < -17) {
        obstacle.kill();
      }
    }, this);

    this.timeText.text = (~~this.timeAlive).toString();

    this.player.animations.play(this.player.body.velocity.y > 0 ? 'flap_down' : 'flap_up');

    this.game.physics.arcade.overlap(this.player, this.obstacles, function (player, obstacle) {

      this.player.kill();
      this.playerEmitter.on = false;
      this.playerEmitter.lifespan = 300;
      this.playerEmitter.setXSpeed(-50, -50);
      this.playerEmitter.setYSpeed(-50, -50);
      this.playerEmitter.emitParticle(undefined, undefined, 'sheet', 8);
      this.playerEmitter.setYSpeed(50, 50);
      this.playerEmitter.emitParticle(undefined, undefined, 'sheet', 8);
      this.playerEmitter.setXSpeed(50, 50);
      this.playerEmitter.emitParticle(undefined, undefined, 'sheet', 8);
      this.playerEmitter.setYSpeed(-50, -50);
      this.playerEmitter.emitParticle(undefined, undefined, 'sheet', 8);

      this.game.time.events.remove(this.obstacleSpawnTimer);
      this.obstacles.forEachAlive(function(obstacle) {
        obstacle.body.velocity.setTo(0);
      });

      if (~~(this.timeAlive) > localStorage.getItem('playerBestScore')) {
        localStorage.setItem('playerBestScore', ~~(this.timeAlive));
      }

      this.gameOverText.text = 'Your Score: ' + ~~(this.timeAlive);
      this.gameOverTextPicture.visible = true;

      this.game.time.events.add(500, function() {
        this.tapToContinueTextPicture.visible = true;

        this.game.input.onTap.add(function() {
          this.game.input.onTap.removeAll();
          this.game.state.start('TitleScreen');
        }, this);
      }, this);
    }, undefined, this);
  },

  render: function() {
    if (this.pointerDownTime > -1) {
      var deltaX = this.pointerDown.x - this.player.x;
      var deltaY = this.pointerDown.y - this.player.y;
      var angle = Math.atan2(deltaY, deltaX);
      var magnitude = this.pointerDownTime > this.playerChargeTime ? 50 : ((this.pointerDownTime / this.playerChargeTime * 0.7 + 0.3) * 50);

      var drawLine = new Phaser.Line(this.player.x, this.player.y, this.player.x + Math.cos(angle) * magnitude,  this.player.y + Math.sin(angle) * magnitude);
      this.game.debug.geom(drawLine, 'white');
    }
    else {
      this.game.debug.reset();
    }
  },

  shutdown: function() {
    this.player = null;

    this.obstacles = null;
    this.obstacleSpawnTimer = null;

    this.pointerDown = null;
  }
};

var main = function() {
  var game = new Phaser.Game(284, 160, Phaser.AUTO, '', null, false, false, Phaser.Physics.ARCADE);

  game.state.add('Preload', Preload, false);
  game.state.add('Load', Load, false);
  game.state.add('TitleScreen', TitleScreen, false);
  game.state.add('Gameplay', Gameplay, false);
  game.state.start('Preload');
}