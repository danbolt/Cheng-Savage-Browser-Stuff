var Gameplay = function() {};
Gameplay.prototype = {
  player: null,
  playerFlySpeed: 60,
  playerChargeTime: 1,

  pointerDown: null,
  pointerDownTime: -1,

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
    this.player = this.game.add.sprite(16, 16, null);
    this.game.physics.arcade.enable(this.player);
    this.player.body.setSize(16, 16);
    this.player.body.bounce.setTo(0.7);
    this.player.body.collideWorldBounds = true;
    this.player.anchor.setTo(0.5);

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
  },

  render: function() {
    this.game.debug.body(this.player);

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
    this.pointerDownPosition = null;
  }
};

var main = function() {

  var game = new Phaser.Game(284, 160, Phaser.AUTO, '', null, false, false, Phaser.Physics.ARCADE);

  game.state.add('Gameplay', Gameplay, false);
  game.state.start('Gameplay');
}