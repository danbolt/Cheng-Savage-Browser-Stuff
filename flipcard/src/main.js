var RED = 0xFF4136;
var BLUE = 0x0074D9;
var GREY = 0xFFFFFF;
var BLOCK = 0xFFFFFF;

var playerMoveSpeed = 200;
var roundTime = 5;

var gameplay = {

  flipTileAffinity: function(x, y, prefferedColour) {
    if (x < 0 || x >= 16 || y < 0 || y >= 12) { return; }

    if (this.tilemap[x][y].color === RED) {
      this.setTileAffinity(x, y, BLUE);
    } else if (this.tilemap[x][y].color === BLUE) {
      this.setTileAffinity(x, y, RED);
    }
    else if (this.tilemap[x][y].color === GREY) {
      this.setTileAffinity(x, y, prefferedColour);
    }
  },
  setTileAffinity: function(x, y, color) {
    if (x < 0 || x >= 16 || y < 0 || y >= 12) { return; }

    this.tilemap[x][y].color = color;
    this.tilemap[x][y].sprite.tint = color;
  },

  preload: function() {
    this.game.load.spritesheet('blocks', 'asset/testmap.png', 32, 32);
  },
  create: function() {
    this.game.stage.backgroundColor = '#363636';

    this.flipcards = this.game.add.group();

    this.mapStartSpot = new Phaser.Point(64, 78);

    this.redScoreText = this.game.add.text(64, 8, 'RED: XXX', {fill: '#FF4136', font: '32px Monaco'});
    this.blueScoreText = this.game.add.text(400, 8, 'BLUE: XXX', {fill: '#0074D9', font: '32px Monaco'});

    this.secondsLeft = roundTime;
    this.timeRemainingText = this.game.add.text(256, 8, this.secondsLeft.toString(), {fill: 'white', font: '36px Monaco' });
    this.timeLoop = this.game.time.events.loop(1000, function() {
      this.secondsLeft--;

      if (this.secondsLeft < 0) {
        this.secondsLeft = 0;
        this.game.time.events.remove(this.timeLoop);
      }
      this.timeRemainingText.text = this.secondsLeft.toString();
    }, this);

    this.tilemap = [];
    for (var i = 0; i < 16; i++) {
      this.tilemap.push([]);
      for (var j = 0; j < 12; j++) {
        var card = this.game.add.sprite(this.mapStartSpot.x + i * 32, this.mapStartSpot.y + j * 32, 'blocks', 1);
        this.flipcards.addChild(card);
        this.tilemap[i].push({
          color: GREY,
          sprite: card
        });
      }
    }

    this.player1 = this.game.add.sprite(this.mapStartSpot.x + 4 * 32, this.mapStartSpot.y + 6 * 32, 'blocks', 0);
    this.player1.tint = 0x8B0000;
    this.player1.scale.setTo(0.8, 0.8);
    this.player1.anchor.setTo(0.5, 0.5);
    this.game.physics.enable(this.player1, Phaser.Physics.ARCADE);

    this.player1Button = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.player1Button.onDown.add(function () {
      this.setTileAffinity(~~((this.player1.x - this.mapStartSpot.x) / 32), ~~((this.player1.y - this.mapStartSpot.y) / 32), RED);
      this.flipTileAffinity(~~((this.player1.x - this.mapStartSpot.x) / 32), ~~((this.player1.y - this.mapStartSpot.y) / 32) - 1, RED);
      this.flipTileAffinity(~~((this.player1.x - this.mapStartSpot.x) / 32), ~~((this.player1.y - this.mapStartSpot.y) / 32) + 1, RED);
      this.flipTileAffinity(~~((this.player1.x - this.mapStartSpot.x) / 32) - 1, ~~((this.player1.y - this.mapStartSpot.y) / 32), RED);
      this.flipTileAffinity(~~((this.player1.x - this.mapStartSpot.x) / 32) + 1, ~~((this.player1.y - this.mapStartSpot.y) / 32), RED);
    }, this);

    this.player2 = this.game.add.sprite(this.mapStartSpot.x + 12 * 32, this.mapStartSpot.y + 6 * 32, 'blocks', 0);
    this.player2.tint = 0x00008B;
    this.player2.scale.setTo(0.8, 0.8);
    this.player2.anchor.setTo(0.5, 0.5);
    this.game.physics.enable(this.player2, Phaser.Physics.ARCADE);

    this.player2Button = this.game.input.keyboard.addKey(Phaser.Keyboard.G);
    this.player2Button.onDown.add(function () {
      this.setTileAffinity(~~((this.player2.x - this.mapStartSpot.x) / 32), ~~((this.player2.y - this.mapStartSpot.y) / 32), BLUE);
      this.flipTileAffinity(~~((this.player2.x - this.mapStartSpot.x) / 32), ~~((this.player2.y - this.mapStartSpot.y) / 32) - 1, BLUE);
      this.flipTileAffinity(~~((this.player2.x - this.mapStartSpot.x) / 32), ~~((this.player2.y - this.mapStartSpot.y) / 32) + 1, BLUE);
      this.flipTileAffinity(~~((this.player2.x - this.mapStartSpot.x) / 32) - 1, ~~((this.player2.y - this.mapStartSpot.y) / 32), BLUE);
      this.flipTileAffinity(~~((this.player2.x - this.mapStartSpot.x) / 32) + 1, ~~((this.player2.y - this.mapStartSpot.y) / 32), BLUE);
    }, this);

    this.walls = this.game.add.group();
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
  },
  update: function() {
    // p1 controls
    if (this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
      this.player1.body.velocity.x = playerMoveSpeed;
    } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
      this.player1.body.velocity.x = -playerMoveSpeed;
    } else {
      this.player1.body.velocity.x = 0;
    }
    if (this.game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
      this.player1.body.velocity.y = playerMoveSpeed;
    } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
      this.player1.body.velocity.y = -playerMoveSpeed;
    } else {
      this.player1.body.velocity.y = 0;
    }

    // p2 controls
    if (this.game.input.keyboard.isDown(Phaser.Keyboard.D)) {
      this.player2.body.velocity.x = playerMoveSpeed;
    } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.A)) {
      this.player2.body.velocity.x = -playerMoveSpeed;
    } else {
      this.player2.body.velocity.x = 0;
    }
    if (this.game.input.keyboard.isDown(Phaser.Keyboard.S)) {
      this.player2.body.velocity.y = playerMoveSpeed;
    } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.W)) {
      this.player2.body.velocity.y = -playerMoveSpeed;
    } else {
      this.player2.body.velocity.y = 0;
    }

    // tally up the scores
    var redCount = 0;
    var blueCount = 0;
    for (var i = 0; i < 16; i++)  {
      for (var j = 0; j < 12; j++) {
        if (this.tilemap[i][j].color === RED) {
          redCount++;
        } else if (this.tilemap[i][j].color === BLUE) {
          blueCount++;
        }
      }
    }
    this.redScoreText.text = 'RED: ' + redCount;
    this.blueScoreText.text = 'BLUE: ' + blueCount;

    this.game.physics.arcade.collide(this.player1, this.walls);
    this.game.physics.arcade.collide(this.player2, this.walls);
    this.game.physics.arcade.collide(this.player1, this.player2);
  }
};

var main = function() {
  var game = new Phaser.Game(640, 480, Phaser.AUTO, '', gameplay, false, null, true, Phaser.Physics.ARCADE);
};
