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

    var that = this;

    // make map array
    this.map = new Array(this.mapWidth);
    for (var i = 0; i < this.map.length; i++) {
      this.map[i] = new Array(this.mapHeight);
    }

    // generate this.map data
    for (var x = 0; x < this.mapWidth; x++) {
      for (var y = 0; y < this.mapHeight; y++) {
        this.map[x][y] = 'wall';
      }
    }
    var rooms = [];
    for (var i = 0; i < this.roomCount; i++) {
      var roomX = ~~(Math.random() * (this.mapWidth - 20) + 10);
      var roomY = ~~(Math.random() * (this.mapHeight - 20) + 10);
      var roomWidth = ~~(Math.random() * 6 + 2);
      var roomHeight = ~~(Math.random() * 6 + 2);

      var colliding = false;
      rooms.forEach(function (room) {
        if (roomX < room.x + room.width + 1 && roomX + roomWidth > room.x - 1 && roomY < room.y + room.height + 1 && roomY + roomHeight > room.y - 1) {
          colliding = true;
        }
      });

      if (!colliding) {
        rooms.push({x: roomX, y: roomY, width: roomWidth, height: roomHeight, color: ~~(Math.random() * 16777216)});
      }
      else {
        i--;
      }
    }
    rooms.forEach(function(room) {
      for (var ix = room.x; ix < room.x + room.width; ix++) {
        for (var iy = room.y; iy < room.y + room.height; iy++) {
          that.map[ix][iy] = room.color;
        }
      }
    });

    {
      var mazeStack = [];
      var x = ~~(this.mapWidth / 2);
      var y = ~~(this.mapHeight / 2);
      while (this.map[x][y] !== 'wall' || this.map[x+1][y] !== 'wall' || this.map[x-1][y] !== 'wall' || this.map[x][y+1] !== 'wall' || this.map[x][y-1] !== 'wall') {
        x = ~~(Math.random() * (this.mapWidth - 2)) + 1;
        y = ~~(Math.random() * (this.mapHeight - 2)) + 1;
      }
      mazeStack.push({x: x, y: y});

      while (mazeStack.length > 0) {
        var pos = mazeStack[~~(mazeStack.length * Math.random())];
        var posIndex = mazeStack.indexOf(pos);
        mazeStack.splice(posIndex, 1);
        if (pos.x === 0 || pos.y === 0 || pos.x === this.mapWidth - 1 || pos.y === this.mapHeight - 1) {
          continue;
        }

        if (this.map[pos.x][pos.y] !== 'wall') {
          continue;
        }

        var wallNeighbourCount = 0;
        if (this.map[pos.x-1][pos.y] === 'wall') { wallNeighbourCount++; }
        if (this.map[pos.x+1][pos.y] === 'wall') { wallNeighbourCount++; }
        if (this.map[pos.x][pos.y-1] === 'wall') { wallNeighbourCount++; }
        if (this.map[pos.x][pos.y+1] === 'wall') { wallNeighbourCount++; }
        if (this.map[pos.x-1][pos.y+1] !== 'wall' && this.map[pos.x-1][pos.y+1] !== 'maze') { wallNeighbourCount--; }
        if (this.map[pos.x+1][pos.y-1] !== 'wall' && this.map[pos.x+1][pos.y-1] !== 'maze') { wallNeighbourCount--; }
        if (this.map[pos.x-1][pos.y-1] !== 'wall' && this.map[pos.x-1][pos.y-1] !== 'maze') { wallNeighbourCount--; }
        if (this.map[pos.x+1][pos.y+1] !== 'wall' && this.map[pos.x+1][pos.y+1] !== 'maze') { wallNeighbourCount--; }

        if (wallNeighbourCount > 2) {
          this.map[pos.x][pos.y] = 'maze';

          mazeStack.push({x: pos.x+1, y:pos.y});
          mazeStack.push({x: pos.x-1, y:pos.y});
          mazeStack.push({x: pos.x, y:pos.y+1});
          mazeStack.push({x: pos.x, y:pos.y-1});
        }
      }
    }


    for (var x = 1; x < this.mapWidth - 1; x++) {
      for (var y = 1; y < this.mapHeight - 1; y++) {
        if (this.map[x][y] !== 'wall') { continue; }

        var wallNeighbourCount = 0;
        if (this.map[x-1][y] === 'wall') { wallNeighbourCount++; }
        if (this.map[x+1][y] === 'wall') { wallNeighbourCount++; }
        if (this.map[x][y-1] === 'wall') { wallNeighbourCount++; }
        if (this.map[x][y+1] === 'wall') { wallNeighbourCount++; }

        if (wallNeighbourCount < 2 && Math.random() < 0.6) {
          this.map[x][y] = undefined;
        }
      }
    }

    rooms.forEach(function (room) {
      if (Math.random() < 0.5) {
        var roll = ~~(Math.random() * room.height);
        that.map[room.x - 1][room.y + roll] = undefined;
        that.map[room.x - 1][room.y + roll - 1] = undefined;
        that.map[room.x - 1][room.y + roll + 1] = undefined;
      } else {
        var roll = ~~(Math.random() * room.height);
        that.map[room.x + room.width][room.y + roll - 1] = undefined;
        that.map[room.x + room.width][room.y + roll] = undefined;
        that.map[room.x + room.width][room.y + roll + 1] = undefined;
      }
    });

    // render static this.map sprites
    for (var x = 0; x < this.mapWidth; x++) {
      for (var y = 0; y < this.mapHeight; y++) {
        if (this.map[x][y] === 'wall') {
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