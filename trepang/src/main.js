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

  mapWidth: 32,
  mapHeight: 32,
  roomCount: 8,

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
        map[x][y] = 'wall';
      }
    }
    var rooms = [];
    for (var i = 0; i < this.roomCount; i++) {
      var roomX = ~~(Math.random() * (this.mapWidth - 10) + 1);
      var roomY = ~~(Math.random() * (this.mapHeight - 10) + 1);
      var roomWidth = ~~(Math.random() * 6 + 4);
      var roomHeight = ~~(Math.random() * 6 + 4);

      var colliding = false;
      rooms.forEach(function (room) {
        if (roomX < room.x + room.width + 1 && roomX + roomWidth > room.x - 1 && roomY < room.y + room.height + 1 && roomY + roomHeight > room.y - 1) {
          colliding = true;
        }
      });

      if (!colliding) {
        rooms.push({x: roomX, y: roomY, width: roomWidth, height: roomHeight});
      }
      else {
        i--;
      }
    }
    rooms.forEach(function(room) {
      for (var ix = room.x; ix < room.x + room.width; ix++) {
        for (var iy = room.y; iy < room.y + room.height; iy++) {
          map[ix][iy] = undefined;
        }
      }
    });



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