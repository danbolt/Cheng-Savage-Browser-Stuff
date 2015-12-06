var Gameplay = function() {};
Gameplay.prototype = {
  timeAlive: 0,

  player: null,
  playerFlySpeed: 60,
  playerChargeTime: 1,

  obstacles: null,
  obstacleSpawnTimer: null,
  obstacleSpawnInterval: 1000,
  obstacleSpeed: 40,

  pointerDown: null,
  pointerDownTime: -1,

  spawnNewObstacle: function() {
    var newObstacle = this.obstacles.getFirstDead();
    newObstacle.revive();
    newObstacle.x = this.game.width;
    newObstacle.y = Math.random() * this.game.height;
    newObstacle.body.velocity.x = -1 * this.obstacleSpeed;
  },

  init: function() {
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.scale.refresh();

    this.game.stage.smoothed = false;

    PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST; //for WebGL
  },

  preload: function() {
    //
  },

  create: function() {
    this.game.stage.backgroundColor = '#001933';

    this.timeAlive = 0;

    this.player = this.game.add.sprite(50, this.game.height / 2, null);
    this.game.physics.arcade.enable(this.player);
    this.player.body.setSize(16, 16);
    this.player.body.bounce.setTo(0.7);
    this.player.body.collideWorldBounds = true;
    this.player.anchor.setTo(0.5);

    this.obstacles = this.game.add.group();
    for (var i = 0; i < 32; i++) {
      var newObstacle = this.game.add.sprite(16, 16, null);
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
  },

  update: function() {
    if (this.pointerDownTime !== -1) {
      this.pointerDownTime += this.game.time.physicsElapsed;
    }

    this.timeAlive += this.game.time.physicsElapsed;

    this.obstacles.forEachAlive(function(obstacle) {
      if (obstacle.x < -17) {
        obstacle.kill();
      }
    }, this);

    this.game.physics.arcade.overlap(this.player, this.obstacles, function (player, obstacle) {
      this.game.state.start('Gameplay');
    }, undefined, this);
  },

  render: function() {
    this.game.debug.text(~~(this.timeAlive), 0, 16);

    this.game.debug.body(this.player);

    this.obstacles.forEachAlive(function(obstacle) {
      this.game.debug.body(obstacle, 'red');
    }, this);

    if (this.pointerDown) {
      var deltaX = this.pointerDown.x - this.player.x;
      var deltaY = this.pointerDown.y - this.player.y;
      var angle = Math.atan2(deltaY, deltaX);
      var magnitude = this.pointerDownTime > this.playerChargeTime ? 50 : ((this.pointerDownTime / this.playerChargeTime * 0.7 + 0.3) * 50);

      var drawLine = new Phaser.Line(this.player.x, this.player.y, this.player.x + Math.cos(angle) * magnitude,  this.player.y + Math.sin(angle) * magnitude);
      this.game.debug.geom(drawLine, 'white');
    }
  },

  shutdown: function() {
    this.player = null;

    this.obstacles = null;
    this.game.time.events.remove(this.obstacleSpawnTimer);
    this.obstacleSpawnTimer = null;

    this.pointerDown = null;
  }
};

var main = function() {
  var game = new Phaser.Game(284, 160, Phaser.AUTO, '', null, false, false, Phaser.Physics.ARCADE);

  game.state.add('Gameplay', Gameplay, false);
  game.state.start('Gameplay');
}