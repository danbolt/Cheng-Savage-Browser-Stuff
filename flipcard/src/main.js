var RED = 0xFF4136;
var BLUE = 0x0074D9;
var GREY = 0xDDDDDD;
var BLOCK = 'BLOCK';

var playerMoveSpeed = 200;
var roundTime = 25;

var preload = function() {};
preload.prototype = {
  preload: function() {
    this.game.load.spritesheet('blocks', 'asset/testmap.png', 32, 32);
  },
  create: function() {
    this.game.state.start('gameplay', true, false);
  }
};

var gameOver = function() {};
gameOver.prototype = {
  init: function(result) {
    this.result = result;
  },
  create: function() {
    this.game.add.text(64, 64, this.result === 'tie' ? 'TIE GAME' : (this.result === 'red' ? 'RED WINS' : 'BLUE WINS'), {fill: (this.result === 'tie' ? '#FFFFFF' : (this.result === 'red' ? '#FF0000' : '#0000FF')), font: '32px Monaco'});

    var resetButton = this.game.add.button(64, 128, 'blocks', function () { this.game.state.start('gameplay'); }, this, 0, 1, 0, 1);
    resetButton.width = 320;
    resetButton.height = 120;

    this.game.add.text(96, 156, 'PLAY AGAIN', {font: '32px Monaco'});
  },
  update: function () {
  }
};

var gameplay = function() {};
gameplay.prototype = {
  flipTileAffinity: function(x, y, prefferedColour) {
    if (x < 0 || x >= 16 || y < 0 || y >= 12) { return; }

    if (this.tilemap[x][y].color === RED) {
      this.setTileAffinity(x, y, BLUE, 'spin');
    } else if (this.tilemap[x][y].color === BLUE) {
      this.setTileAffinity(x, y, RED, 'spin');
    }
    else if (this.tilemap[x][y].color === GREY) {
      this.setTileAffinity(x, y, prefferedColour, 'spin');
    }
  },
  setTileAffinity: function(x, y, color, animate) {
    if (x < 0 || x >= 16 || y < 0 || y >= 12) { return; }
    if (this.tilemap[x][y].color === BLOCK) { return; }

    if (!animate) {
      this.tilemap[x][y].color = color;
      this.tilemap[x][y].sprite.tint = color;
    }

    if (animate === 'spin' && !(this.tilemap[x][y].sprite.tweening)) {
      this.tilemap[x][y].color = color;
      this.tilemap[x][y].sprite.tint = color;

      this.tilemap[x][y].sprite.tweening = true;
      var newTween = this.game.add.tween(this.tilemap[x][y].sprite);
      newTween.to({rotation: this.tilemap[x][y].sprite.rotation + (Math.PI / 2)}, 150);
      newTween.onComplete.add(function() { this.tilemap[x][y].sprite.tweening = false; }, this);
      newTween.start();
    } else if (animate === 'flip' && !(this.tilemap[x][y].sprite.tweening)) {
      this.tilemap[x][y].color = color;

      this.tilemap[x][y].sprite.tweening = true;
      var newTween = this.game.add.tween(this.tilemap[x][y].sprite.scale);
      var newTween2 = this.game.add.tween(this.tilemap[x][y].sprite.scale);
      newTween.to({x: 0.5, y: 0.5}, 75);
      newTween2.to({x: 1, y: 1}, 75);
      newTween.onComplete.add(function() {
        newTween2.start();
        this.tilemap[x][y].sprite.tint = color;
      }, this);
      newTween2.onComplete.add(function() { this.tilemap[x][y].sprite.tweening = false; }, this);
      newTween.start();
    }
  },
  timeLoopFunction: function() {
    this.secondsLeft--;

    if (this.secondsLeft < 0) {
      this.secondsLeft = roundTime;
      this.game.time.events.remove(this.timeLoop);
      this.betweenRounds = true;
      this.resultText.visible = true;
      this.resultText.text = this.redCount === this.blueCount ? 'TIE' : (this.redCount > this.blueCount ? 'RED HAS MORE' : 'BLUE HAS MORE');
      this.resultText.fill = this.redCount === this.blueCount ? 'black' : (this.redCount > this.blueCount ? 'red' : 'blue');

      if (this.round < 3) {
        this.roundIcons.children[this.round].tint = (this.redCount == this.blueCount) ? GREY : (this.redCount > this.blueCount ? RED : BLUE);
        this.round++;

        this.game.time.events.add(2000, function () {
          this.game.time.events.loop(1000, this.timeLoopFunction, this);
          this.betweenRounds = false;
          this.resultText.visible = false;
        }, this);
      } else if (this.round === 3)
      {
        this.game.time.events.add(1000, function() {
          var redWinCount = 0;
          var blueWinCount = 0;
          for (var i = 0; i < 3; i++) {
            if (this.roundIcons.children[i].tint === RED) { redWinCount++; }
            else if (this.roundIcons.children[i].tint === BLUE) { blueWinCount++; }
          }
          this.game.state.start('gameOver', true, false, (redWinCount === blueWinCount) ? 'tie' : (redWinCount > blueWinCount ? 'red': 'blue'));
        }, this);
      }
    }
    this.timeRemainingText.text = this.secondsLeft.toString();
  },

  create: function() {
    this.game.stage.backgroundColor = '#363636';

    this.redCount = 0;
    this.blueCount = 0;

    this.betweenRounds = false;

    this.roundIcons = this.game.add.group();
    for (var i = 0; i < 3; i++) {
      var roundGlyph = this.game.add.sprite(16, 128 + i * 48, 'blocks', 1);
      this.roundIcons.addChild(roundGlyph);
    }

    this.round = 0;

    this.walls = this.game.add.group();

    this.flipcards = this.game.add.group();

    this.mapStartSpot = new Phaser.Point(64, 78);

    this.redScoreText = this.game.add.text(64, 8, 'RED: XXX', {fill: '#FF4136', font: '32px Monaco'});
    this.blueScoreText = this.game.add.text(400, 8, 'BLUE: XXX', {fill: '#0074D9', font: '32px Monaco'});

    this.secondsLeft = roundTime;
    this.timeRemainingText = this.game.add.text(256, 8, this.secondsLeft.toString(), {fill: 'white', font: '36px Monaco' });
    this.timeLoop = this.game.time.events.loop(1000, this.timeLoopFunction, this);

    var counter = 5;
    this.tilemap = [];
    for (var i = 0; i < 16; i++) {
      this.tilemap.push([]);
      for (var j = 0; j < 12; j++) {
        if (((i === 16 / 2 - 1 || i === 16 / 2) && (j === 2 || j === 3)) || ((i === 16 / 4 - 1 || i === 16 / 4) && (j === 8 || j === 9)) || ((i === 16 / 4 * 3 - 1 || i === 16 / 4 * 3) && (j === 8 || j === 9))) {
          var card = this.game.add.sprite(this.mapStartSpot.x + i * 32 + 16, this.mapStartSpot.y + j * 32 + 16, 'blocks', counter);
          card.anchor.setTo(0.5, 0.5);
          this.flipcards.addChild(card);
          this.tilemap[i].push({
            color: BLOCK,
            sprite: card
          });
          this.game.physics.enable(card, Phaser.Physics.ARCADE);
          this.walls.addChild(card);
          this.walls.addToHash(card);
          card.body.immovable = true;

          switch (counter) {
            case 5:
              counter = 13;
              break;
            case 7:
              counter = 15;
              break;
            case 13:
              counter = 7;
              break;
            case 15:
              counter = 5;
              break;
          }
          continue;
        }

        var card = this.game.add.sprite(this.mapStartSpot.x + i * 32 + 16, this.mapStartSpot.y + j * 32 + 16, 'blocks', 1);
        card.anchor.setTo(0.5, 0.5);
        this.flipcards.addChild(card);
        this.tilemap[i].push({
          color: GREY,
          sprite: card
        });
      }
    }

    this.p1Emitter = this.game.add.emitter(0, 0);
    this.p1Emitter.makeParticles('blocks', 1);
    this.p1Emitter.setScale(0.8, 0, 0.8, 0, 500, Phaser.Easing.Linear.None);
    this.p1Emitter.start(false, 200, 30);
    this.p1Emitter.setAll('tint', 0x8B0000);
    this.p1Emitter.setXSpeed(-0, 0);
    this.p1Emitter.setYSpeed(-0, 0);
    this.p1Emitter.gravity = 0;

    this.player1 = this.game.add.sprite(this.mapStartSpot.x + 4 * 32, this.mapStartSpot.y + 6 * 32, 'blocks', 1);
    this.player1.tint = 0x8B0000;
    this.player1.scale.setTo(0.8, 0.8);
    this.player1.anchor.setTo(0.5, 0.5);
    this.game.physics.enable(this.player1, Phaser.Physics.ARCADE);

    this.player1Button = this.game.input.keyboard.addKey(Phaser.Keyboard.M);
    this.player1Button.onDown.add(function () {
      if (this.betweenRounds) { return; }

      this.setTileAffinity(~~((this.player1.x - this.mapStartSpot.x) / 32), ~~((this.player1.y - this.mapStartSpot.y) / 32), RED, 'flip');
      this.flipTileAffinity(~~((this.player1.x - this.mapStartSpot.x) / 32), ~~((this.player1.y - this.mapStartSpot.y) / 32) - 1, RED);
      this.flipTileAffinity(~~((this.player1.x - this.mapStartSpot.x) / 32), ~~((this.player1.y - this.mapStartSpot.y) / 32) + 1, RED);
      this.flipTileAffinity(~~((this.player1.x - this.mapStartSpot.x) / 32) - 1, ~~((this.player1.y - this.mapStartSpot.y) / 32), RED);
      this.flipTileAffinity(~~((this.player1.x - this.mapStartSpot.x) / 32) + 1, ~~((this.player1.y - this.mapStartSpot.y) / 32), RED);
    }, this);

    this.p2Emitter = this.game.add.emitter(0, 0);
    this.p2Emitter.makeParticles('blocks', 1);
    this.p2Emitter.setScale(0.8, 0, 0.8, 0, 500, Phaser.Easing.Linear.None);
    this.p2Emitter.start(false, 200, 30);
    this.p2Emitter.setAll('tint', 0x00008B);
    this.p2Emitter.setXSpeed(-0, 0);
    this.p2Emitter.setYSpeed(-0, 0);
    this.p2Emitter.gravity = 0;

    this.player2 = this.game.add.sprite(this.mapStartSpot.x + 12 * 32, this.mapStartSpot.y + 6 * 32, 'blocks', 1);
    this.player2.tint = 0x00008B;
    this.player2.scale.setTo(0.8, 0.8);
    this.player2.anchor.setTo(0.5, 0.5);
    this.game.physics.enable(this.player2, Phaser.Physics.ARCADE);

    this.player2Button = this.game.input.keyboard.addKey(Phaser.Keyboard.G);
    this.player2Button.onDown.add(function () {
      if (this.betweenRounds) { return; }

      this.setTileAffinity(~~((this.player2.x - this.mapStartSpot.x) / 32), ~~((this.player2.y - this.mapStartSpot.y) / 32), BLUE, 'flip');
      this.flipTileAffinity(~~((this.player2.x - this.mapStartSpot.x) / 32), ~~((this.player2.y - this.mapStartSpot.y) / 32) - 1, BLUE);
      this.flipTileAffinity(~~((this.player2.x - this.mapStartSpot.x) / 32), ~~((this.player2.y - this.mapStartSpot.y) / 32) + 1, BLUE);
      this.flipTileAffinity(~~((this.player2.x - this.mapStartSpot.x) / 32) - 1, ~~((this.player2.y - this.mapStartSpot.y) / 32), BLUE);
      this.flipTileAffinity(~~((this.player2.x - this.mapStartSpot.x) / 32) + 1, ~~((this.player2.y - this.mapStartSpot.y) / 32), BLUE);
    }, this);

    for (var i = 0; i < 16; i++) {
      var w = this.game.add.sprite(this.mapStartSpot.x + i * 32, this.mapStartSpot.y - 32, 'blocks', 14);
      this.game.physics.enable(w, Phaser.Physics.ARCADE);
      this.walls.addChild(w);
      this.walls.addToHash(w);
      w.body.immovable = true;
      w = this.game.add.sprite(this.mapStartSpot.x + i * 32, this.mapStartSpot.y + 12 * 32, 'blocks', 6);
      this.game.physics.enable(w, Phaser.Physics.ARCADE);
      this.walls.addChild(w);
      this.walls.addToHash(w);
      w.body.immovable = true;
    }
    for (var i = 0; i < 12; i++) {
      var w = this.game.add.sprite(this.mapStartSpot.x - 32, this.mapStartSpot.y + i * 32, 'blocks', 11);
      this.game.physics.enable(w, Phaser.Physics.ARCADE);
      this.walls.addChild(w);
      this.walls.addToHash(w);
      w.body.immovable = true;
      w = this.game.add.sprite(this.mapStartSpot.x + 16 * 32, this.mapStartSpot.y + i * 32, 'blocks', 9);
      this.game.physics.enable(w, Phaser.Physics.ARCADE);
      this.walls.addChild(w);
      this.walls.addToHash(w);
      w.body.immovable = true;
    }

    this.resultText = this.game.add.text(256, 256, 'RED WINS', {fill: 'white', font: '32px Monaco'});
    this.resultText.visible = false;

    this.game.world.bringToTop(this.roundIcons);
  },
  update: function() {
    this.p1Emitter.x = this.player1.x;
    this.p1Emitter.y = this.player1.y;
    this.p2Emitter.x = this.player2.x;
    this.p2Emitter.y = this.player2.y;

    if (this.player1.target) {
      if (!this.player1.target.isDown) {
        this.player1.target = undefined;
      }
    }
    this.game.input.pointers.forEach(function(pointer) {
      if (!this.player1.target && pointer.isDown && Phaser.Point.distance(this.player1, pointer) < 32) {
        this.player1.target = pointer;
      }
    }, this);

    // p1 controls
    if (this.player1.target) {
      var angle = Math.atan2(this.player1.target.y - this.player1.y, this.player1.target.x - this.player1.x);
      this.player1.body.velocity.x = playerMoveSpeed * Math.cos(angle);
    } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
      this.player1.body.velocity.x = playerMoveSpeed;
    } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
      this.player1.body.velocity.x = -playerMoveSpeed;
    } else if (!this.player1.target) {
      this.player1.body.velocity.x = 0;
    }
    if (this.player1.target) {
      var angle = Math.atan2(this.player1.target.y - this.player1.y, this.player1.target.x - this.player1.x);
      this.player1.body.velocity.y = playerMoveSpeed * Math.sin(angle);
    } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
      this.player1.body.velocity.y = playerMoveSpeed;
    } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
      this.player1.body.velocity.y = -playerMoveSpeed;
    } else if (!this.player1.target) {
      this.player1.body.velocity.y = 0;
    }

    if (this.player2.target) {
      if (!this.player2.target.isDown) {
        this.player2.target = undefined;
      }
    }
    this.game.input.pointers.forEach(function(pointer) {
      if (!this.player2.target && pointer.isDown && Phaser.Point.distance(this.player2, pointer) < 32) {
        this.player2.target = pointer;
      }
    }, this);

    // p2 controls
    if (this.player2.target) {
      var angle = Math.atan2(this.player2.target.y - this.player2.y, this.player2.target.x - this.player2.x);
      this.player2.body.velocity.x = playerMoveSpeed * Math.cos(angle);
    } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.D)) {
      this.player2.body.velocity.x = playerMoveSpeed;
    } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.A)) {
      this.player2.body.velocity.x = -playerMoveSpeed;
    } else if (!this.player2.target) {
      this.player2.body.velocity.x = 0;
    }
    if (this.player2.target) {
      var angle = Math.atan2(this.player2.target.y - this.player2.y, this.player2.target.x - this.player2.x);
      this.player2.body.velocity.y = playerMoveSpeed * Math.sin(angle);
    } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.S)) {
      this.player2.body.velocity.y = playerMoveSpeed;
    } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.W)) {
      this.player2.body.velocity.y = -playerMoveSpeed;
    } else if (!this.player2.target) {
      this.player2.body.velocity.y = 0;
    }

    this.game.input.onTap.add(function(pointer) {
      if (pointer.x > this.player1.x - 16 && pointer.x < this.player1.x + this.player1.width - 16 && pointer.y > this.player1.y - 16 && pointer.y < this.player1.y + this.player1.height - 16) {
        if (this.betweenRounds) { return; }

        this.setTileAffinity(~~((this.player1.x - this.mapStartSpot.x) / 32), ~~((this.player1.y - this.mapStartSpot.y) / 32), RED, 'flip');
        this.flipTileAffinity(~~((this.player1.x - this.mapStartSpot.x) / 32), ~~((this.player1.y - this.mapStartSpot.y) / 32) - 1, RED);
        this.flipTileAffinity(~~((this.player1.x - this.mapStartSpot.x) / 32), ~~((this.player1.y - this.mapStartSpot.y) / 32) + 1, RED);
        this.flipTileAffinity(~~((this.player1.x - this.mapStartSpot.x) / 32) - 1, ~~((this.player1.y - this.mapStartSpot.y) / 32), RED);
        this.flipTileAffinity(~~((this.player1.x - this.mapStartSpot.x) / 32) + 1, ~~((this.player1.y - this.mapStartSpot.y) / 32), RED);
      }

      if (pointer.x > this.player2.x - 16 && pointer.x < this.player2.x + this.player2.width - 16 && pointer.y > this.player2.y - 16 && pointer.y < this.player2.y + this.player2.height - 16) {
        if (this.betweenRounds) { return; }

        this.setTileAffinity(~~((this.player2.x - this.mapStartSpot.x) / 32), ~~((this.player2.y - this.mapStartSpot.y) / 32), BLUE, 'flip');
        this.flipTileAffinity(~~((this.player2.x - this.mapStartSpot.x) / 32), ~~((this.player2.y - this.mapStartSpot.y) / 32) - 1, BLUE);
        this.flipTileAffinity(~~((this.player2.x - this.mapStartSpot.x) / 32), ~~((this.player2.y - this.mapStartSpot.y) / 32) + 1, BLUE);
        this.flipTileAffinity(~~((this.player2.x - this.mapStartSpot.x) / 32) - 1, ~~((this.player2.y - this.mapStartSpot.y) / 32), BLUE);
        this.flipTileAffinity(~~((this.player2.x - this.mapStartSpot.x) / 32) + 1, ~~((this.player2.y - this.mapStartSpot.y) / 32), BLUE);
      }
    }, this);

    // tally up the scores
    this.redCount = 0;
    this.blueCount = 0;
    for (var i = 0; i < 16; i++)  {
      for (var j = 0; j < 12; j++) {
        if (this.tilemap[i][j].color === RED) {
          this.redCount++;
        } else if (this.tilemap[i][j].color === BLUE) {
          this.blueCount++;
        }
      }
    }
    this.redScoreText.text = 'RED: ' + this.redCount;
    this.blueScoreText.text = 'BLUE: ' + this.blueCount;

    this.game.physics.arcade.collide(this.player1, this.walls);
    this.game.physics.arcade.collide(this.player2, this.walls);
    this.game.physics.arcade.collide(this.player1, this.player2);
  }
};

var main = function() {
  var game = new Phaser.Game(640, 480, Phaser.AUTO, 'gamewindow', null, false, null, true, Phaser.Physics.ARCADE);

  game.state.add('preload', preload, false);
  game.state.add('gameOver', gameOver, false);
  game.state.add('gameplay', gameplay, false);
  game.state.start('preload');
};
