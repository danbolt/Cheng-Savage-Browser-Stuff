var Preload = function() {};
Preload.prototype = {
  preload: function() {
    this.game.load.image('loading', 'img/loading.png');
  },

  init: function() {
    this.game.state.start('Dungeon', true, false);
  }
};

var Dungeon = function() {};
Dungeon.prototype = {

  mapWidth: 64,
  mapHeight: 64,

  map: null,

  loadRender: function() {
    //
  },

  loadUpdate: function() {
    //
  },

  preload: function() {
    this.game.load.spritesheet('trepang', 'img/trepangSheet.png', 16, 16);
  },

  create: function() {
    // make map array
    map = new Array(this.mapWidth);
    for (var i = 0; i < map.length; i++) {
      map[i] = new Array(this.mapHeight);
    }

    // generate map data
    for (var x = 0; x < this.mapWidth; x++) {
      for (var y = 0; y < this.mapHeight; y++) {
        map[x][y] = Math.random() < 0.3 ? 'wall' : undefined;
      }
    }

    // render static map sprites
    for (var x = 0; x < this.mapWidth; x++) {
      for (var y = 0; y < this.mapHeight; y++) {
        if (map[x][y] === 'wall') {
          this.game.add.sprite(x * 16, y * 16, 'trepang', 20);
        }
      }
    }
  },

  update: function() {
    //
  }
};

var main = function() {
  var game = new Phaser.Game(640, 480, Phaser.AUTO, '', null, false, false);
  game.state.add('Dungeon', Dungeon, false);
  game.state.add('Preload', Preload, true);
};