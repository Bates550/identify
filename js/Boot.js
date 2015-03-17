Identify = {

	/* Here we've just got some global level vars that persist regardless of State swaps */
	score: 0,

	/* If the music in your game needs to play through-out a few State swaps, then you could reference it here */
	music: null,

	/* Your game can check Identify.orientated in internal loops to know if it should pause or not */
	orientated: false,

	isoGroup: undefined,

	player: undefined,
};

Identify.Boot = function (game) {
};

Identify.Boot.prototype = {

	preload: function () {
		this.game.load.image('tile', 'images/tile.png');
		this.game.load.image('edge_up', 'images/edge_up.png');
		this.game.load.image('edge_right', 'images/edge_right.png');
		this.game.load.image('edge_down', 'images/edge_down.png');
		this.game.load.image('edge_left', 'images/edge_left.png');
		this.game.load.image('wall_up', 'images/wall_up.png');
		this.game.load.image('wall_left', 'images/wall_left.png');
		this.game.load.image('arrow_up', 'images/arrow_up.png');
		this.game.load.image('arrow_right', 'images/arrow_right.png');
		this.game.load.image('arrow_down', 'images/arrow_down.png');
		this.game.load.image('arrow_left', 'images/arrow_left.png');
		this.game.load.image('scroll', 'images/scroll.png');
		this.game.load.image('nunchakus', 'images/nunchakus.png');
		this.game.load.image('dragon', 'images/dragon.png');
		this.game.load.image('lotus', 'images/lotus.png');
		this.game.load.image('ash', 'images/ash.png');
		this.game.load.image('player_fly', 'images/tran_fly.png');
		this.game.load.spritesheet('player', 'images/tran_walk.png', 72, 112);
		this.game.load.spritesheet('player_blurry', 'images/tran_walk_blurry.png', 36, 56);
		this.game.load.spritesheet('player_blurriest', 'images/tran_walk_blurriest.png', 18, 28);
		this.game.load.spritesheet('explosion', 'images/explosion.png', 50, 40);
		this.game.plugins.add(new Phaser.Plugin.Isometric(this.game));
		this.game.iso.anchor.setTo(0.5, 0.5);
		this.game.stage.backgroundColor = '#8595a1';
	},

	create: function () {
		this.isoGroup = this.game.add.group();

		var addBackground = function(game, group) {
			var tile;
			for (var x = 0; x < 192; x += 64) {
				for (var y = 0; y < 192; y += 64) {
					tile = game.add.isoSprite(x, y, 0, 'tile', 0, group);
					tile.anchor.set(0.5);
					tile.scale.set(1.6);
				}
			}

			var edge;
			edge = game.add.isoSprite(60, -60, 0, 'edge_up', 0, group);
			edge.anchor.set(0.5);
			edge.scale.set(1.6);
			edge = game.add.isoSprite(192, 64, 0, 'edge_right', 0, group);
			edge.anchor.set(0.5);
			edge.scale.set(1.6);
			edge = game.add.isoSprite(64, 192, 0, 'edge_down', 0, group);
			edge.anchor.set(0.5);
			edge.scale.set(1.6);
			edge = game.add.isoSprite(-60, 60, 0, 'edge_left', 0, group);
			edge.anchor.set(0.5);
			edge.scale.set(1.6);

			var wall;
			wall = game.add.isoSprite(0, -37, 59, 'wall_up', 0, group);
			wall.anchor.set(0.5);
			wall.scale.set(1.6);
			wall = game.add.isoSprite(128, -37, 59, 'wall_up', 0, group);
			wall.anchor.set(0.5);
			wall.scale.set(1.6);
			wall = game.add.isoSprite(-37, 0, 59, 'wall_left', 0, group);
			wall.anchor.set(0.5);
			wall.scale.set(1.6);
			wall = game.add.isoSprite(-37, 128, 59, 'wall_left', 0, group);
			wall.anchor.set(0.5);
			wall.scale.set(1.6);
		}

		var explode = function(game, x, y) {
			var sprite = game.add.isoSprite(17+x*68, 17+y*68, 0, 'explosion', 0);
			sprite.anchor.set(0.5);
			sprite.scale.set(2.0);
			sprite.animations.add('explode', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 12, false);
			sprite.animations.play('explode');
			setTimeout(function() {
				sprite.destroy();
			}, 300);
		}

		//+ Jonas Raoni Soares Silva
		//@ http://jsfromhell.com/array/shuffle [v1.0]
		var shuffle = function(o){ //v1.0
		    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
		    return o;
		}

		this.player = {
			fps: 6,
			blur: 'blurriest',
			direction: 'down',
			pos: { x: 0, y: 0 },
			score: {
				value: 0,
				obj: undefined,
				increment: function(game, player) {
					++this.value;
					if (this.value === 8 || this.value === 16) {
						player.toggleBlur(game);
					}
					else if (this.value === 24) {
						// Goal state
						player.fly(game);
					}
				}
			},
			moving: {
				value: false,
				timer: 0,
				dir: undefined
			},
			room: {
				grid: [0, 0, 0, 0], // Corresponds to (-1,-1), (1,-1), (-1,1), and (1,1)
				items: [undefined, undefined, undefined, undefined],
				ashes: [undefined, undefined, undefined, undefined],
				isOccupied: function(x, y) {
					if (x === 1) {
						if (y === 1) {
							return this.grid[3] === 1 ? true : false;
						}
						else if (y === -1) {
							return this.grid[1] === 1 ? true : false;
						}
					}
					else if (x === -1) {
						if (y === 1) {
							return this.grid[2] === 1 ? true : false;
						}
						else if (y === -1) {
							return this.grid[0] === 1 ? true : false;
						}
					}
				},
				destroy: function(x, y) {
					if (x === 1) {
						if (y === 1) {
							this.items[3].destroy();
							this.ashes[3].visible = true;
							this.grid[3] = 0;
						}
						else if (y === -1) {
							this.items[1].destroy();
							this.ashes[1].visible = true;
							this.grid[1] = 0;
						}
					}
					else if (x === -1) {
						if (y === 1) {
							this.items[2].destroy();
							this.ashes[2].visible = true;
							this.grid[2] = 0;
						}
						else if (y === -1) {
							this.items[0].destroy();
							this.ashes[0].visible = true;
							this.grid[0] = 0;
						}
					}
				},
				destroyAll: function() {
					for (var i = 0; i < 4; ++i) {
						this.items[i].destroy();
						this.ashes[i].visible = false;
						this.grid[i] = 0;
					}
				},
				addItems: function(game) {
					var itemsInfo = [
						{ name: 'dragon', scale: 0.5 },
						{ name: 'nunchakus', scale: 2.0 },
						{ name: 'scroll', scale: 2.0 },
						{ name: 'lotus', scale: 1.3 }
					];
					shuffle(itemsInfo);

					this.items[0] = game.add.isoSprite(-20, -20, 0, itemsInfo[0].name, 0);
					this.items[0].anchor.set(0.5);
					this.items[0].scale.set(itemsInfo[0].scale);
					this.grid[0] = 1;
					this.ashes[0] = game.add.isoSprite(-5, -5, 0, 'ash', 0);
					this.ashes[0].anchor.set(0.5);
					this.ashes[0].visible = false;

					this.items[1] = game.add.isoSprite(115, -20, 0, itemsInfo[1].name, 0);
					this.items[1].anchor.set(0.5);
					this.items[1].scale.set(itemsInfo[1].scale);
					this.grid[1] = 1;
					this.ashes[1] = game.add.isoSprite(125, -5, 0, 'ash', 0);
					this.ashes[1].anchor.set(0.5);
					this.ashes[1].visible = false;

					this.items[2] = game.add.isoSprite(-20, 115, 0, itemsInfo[3].name, 0);
					this.items[2].anchor.set(0.5);
					this.items[2].scale.set(itemsInfo[3].scale);
					this.grid[2] = 1;
					this.ashes[2] = game.add.isoSprite(-5, 125, 0, 'ash', 0);
					this.ashes[2].anchor.set(0.5);
					this.ashes[2].visible = false;

					this.items[3] = game.add.isoSprite(115, 115, 0, itemsInfo[2].name, 0);
					this.items[3].anchor.set(0.5);
					this.items[3].scale.set(itemsInfo[2].scale);
					this.grid[3] = 1;
					this.ashes[3] = game.add.isoSprite(125, 125, 0, 'ash', 0);
					this.ashes[3].anchor.set(0.5);
					this.ashes[3].visible = false;
				}
			},
			move: function(dir, game) {
				if (this.pos.x === -1) { // Player must be in (-1,0) since (-1,-1) and (-1,1) are inaccessible
					if (dir === 'up') {
						// Destroy thing in (-1,-1)
						if (this.room.isOccupied(-1, -1)) {
							this.room.destroy(-1, -1);
							this.score.increment(game, this);
							explode(game, -1, -1);
						}
					}
					else if (dir === 'right') {
						this.moving = { value: true, timer: 35, dir: dir}; // 35 is a magic number
						this.sprite.animations.play(this.moving.dir);
					}
					else if (dir === 'down') {
						// Destroy thing in (-1,1)
						if (this.room.isOccupied(-1, 1)) {
							this.room.destroy(-1, 1);
							this.score.increment(game, this);
							explode(game, -1, 1);
						}
					}
					else if (dir === 'left') {
						// Go to new room
						this.moving = { value: true, timer: 17, dir: dir}; // 35 is a magic number
						this.sprite.animations.play(this.moving.dir);
						this.pos = { x:2, y:0 };
						var that = this;
						setTimeout(function() {
							that.newRoom();
							that.room.addItems(game);
							that.addSprite(game);
						}, 500);
					}
				}
				else if (this.pos.x === 1) { // Player must be in (1,0) since (1,-1) and (1,1) are inaccessible
					if (dir === 'up') {
						// Destroy thing in (1,-1)
						if (this.room.isOccupied(1, -1)) {
							this.room.destroy(1, -1);
							this.score.increment(game, this);
							explode(game, 1, -1);
						}
					}
					else if (dir === 'right') {
						// Go to new room
						this.moving = { value: true, timer: 17, dir: dir}; // 35 is a magic number
						this.sprite.animations.play(this.moving.dir);
						this.pos = { x:-2, y:0 };
						var that = this;
						setTimeout(function() {
							that.newRoom();
							that.room.addItems(game);
							that.addSprite(game);
						}, 500);
					}
					else if (dir === 'down') {
						// Destroy thing in (1,1)
						if (this.room.isOccupied(1, 1)) {
							this.room.destroy(1, 1);
							this.score.increment(game, this);
							explode(game, 1, 1);
						}
					}
					else if (dir === 'left') {
						this.moving = { value: true, timer: 35, dir: dir}; // 35 is a magic number
						this.sprite.animations.play(this.moving.dir);
					}
				}
				else if (this.pos.y === -1) { // Player must be in (0,-1) since (-1,-1) and (1,-1) are inaccessible
					if (dir === 'up') {
						// Go to new room
						this.moving = { value: true, timer: 17, dir: dir}; // 35 is a magic number
						this.sprite.animations.play(this.moving.dir);
						this.pos = { x:0, y:2 };
						var that = this;
						setTimeout(function() {
							that.newRoom();
							that.room.addItems(game);
							that.addSprite(game);
						}, 500);
					}
					else if (dir === 'right') {
						// Destroy thing in (1,-1)
						if (this.room.isOccupied(1, -1)) {
							this.room.destroy(1, -1);
							this.score.increment(game, this);
							explode(game, 1, -1);
						}
					}
					else if (dir === 'down') {
						this.moving = { value: true, timer: 35, dir: dir}; // 35 is a magic number
						this.sprite.animations.play(this.moving.dir);
					}
					else if (dir === 'left') {
						// Destroy thing in (-1,-1)
						if (this.room.isOccupied(-1, -1)) {
							this.room.destroy(-1, -1);
							this.score.increment(game, this);
							explode(game, -1, -1);
						}
					}
				}
				else if (this.pos.y === 1) { // Player must be in (0,1) since (-1,1) and (1,1) are inaccessible
					if (dir === 'up') {
						this.moving = { value: true, timer: 35, dir: dir}; // 35 is a magic number
						this.sprite.animations.play(this.moving.dir);
					}
					else if (dir === 'right') {
						// Destroy thing in (1,1)
						if (this.room.isOccupied(1, 1)) {
							this.room.destroy(1, 1);
							this.score.increment(game, this);
							explode(game, 1, 1);
						}
					}
					else if (dir === 'down') {
						// Go to new room
						this.moving = { value: true, timer: 17, dir: dir}; // 35 is a magic number
						this.sprite.animations.play(this.moving.dir);
						this.pos = { x:0, y:-2 };
						var that = this;
						setTimeout(function() {
							that.newRoom();
							that.room.addItems(game);
							that.addSprite(game);
						}, 500);
					}
					else if (dir === 'left') {
						// Destroy thing in (-1,1)
						if (this.room.isOccupied(-1, 1)) {
							this.room.destroy(-1, 1);
							this.score.increment(game, this);
							explode(game, -1, 1);
						}
					}
				}
				else { // In (0,0)
					this.moving = { value: true, timer: 35, dir: dir}; // 35 is a magic number
					this.sprite.animations.play(this.moving.dir);
				}
			},
			addSprite: function(game) {
				if (this.sprite !== undefined) { this.sprite.destroy(); }
				var startX = 17+this.pos.x*68; // 68 is a magic number
				var startY = 17+this.pos.y*68; // 17 is also magic :3
				var startFrame = 3;
				switch(this.moving.dir) {
					case 'up':
						startFrame = 18;
						break;
					case 'right':
						startFrame = 6;
						break;
					case 'down':
						startFrame = 3;
						break;
					case 'left':
						startFrame = 15;
						break;
				}
				switch(this.blur) {
					case 'none':
						this.sprite = game.add.isoSprite(startX, startY, 0, 'player', startFrame);
						this.sprite.scale.set(1);
						break;
					case 'blurry':
						this.sprite = game.add.isoSprite(startX, startY, 0, 'player_blurry', startFrame);
						this.sprite.scale.set(2);
						break;
					case 'blurriest':
						this.sprite = game.add.isoSprite(startX, startY, 0, 'player_blurriest', startFrame);
						this.sprite.scale.set(4);
						break;
				}
				this.sprite.anchor.set(0.5);
				this.sprite.animations.add('up', [19, 18, 20, 18], this.fps, false);
				this.sprite.animations.add('right', [7, 6, 8, 6], this.fps, false);
				this.sprite.animations.add('down', [4, 3, 5, 3], this.fps, false);
				this.sprite.animations.add('left', [16, 15, 17, 15], this.fps, false);
			},
			update: function(game) {
				var speed = 2; // 2 is a magic number
				// If the player is not in already in the process of moving
				if (!this.moving.value) {

					if (game.cursors.up.isDown) {
						this.move('up', game);
					}
					else if (game.cursors.right.isDown) {
						this.move('right', game);
					}
					else if (game.cursors.down.isDown) {
						this.move('down', game);
					}
					else if (game.cursors.left.isDown) {
						this.move('left', game);
					}
				}
				// Else the player is in the process of moving
				else {
					var doneMoving;
					// If they're done moving
					if (--this.moving.timer <= 0) {
						switch(this.moving.dir) {
							case 'up':
								this.pos = { x: this.pos.x, y: this.pos.y-1 };
								break;
							case 'right':
								this.pos = { x: this.pos.x+1, y: this.pos.y };
								break;
							case 'down':
								this.pos = { x: this.pos.x, y: this.pos.y+1 };
								break;
							case 'left':
								this.pos = { x: this.pos.x-1, y: this.pos.y };
								break;
						}
						this.moving.value = false;
					}
					// Else they're not done moving
					else {
						switch(this.moving.dir) {
							case 'up':
								this.sprite.isoY -= speed;
								break;
							case 'right':
								this.sprite.isoX += speed;
								break;
							case 'down':
								this.sprite.isoY += speed;
								break;
							case 'left':
								this.sprite.isoX -= speed;
								break;
						}
					}
				}
				if (this.score.obj !== undefined) {
					this.score.obj.destroy();
				}
				this.score.obj = game.add.text(50, 50, ""+this.score.value);
			},
			toggleBlur: function(game) {
				if (this.blur === 'none') { this.blur = 'blurriest'; }
				else if (this.blur === 'blurriest') { this.blur = 'blurry'; }
				else { this.blur = 'none'; }
				this.addSprite(game);
			},
			newRoom: function(game) {
				this.room.destroyAll();
			},
			fly: function(game) {
				this.sprite.destroy();
				var startX = 17+this.pos.x*68; // 68 is a magic number
				var startY = 17+this.pos.y*68; // 17 is also magic :3
				this.sprite = game.add.isoSprite(startX, startY, 0, 'player_fly', 0);
				this.sprite.anchor.set(0.5);
				this.sprite.scale.set(1);
				var tween = game.add.tween(this.sprite).to({ isoZ: 1000 }, 2500 , Phaser.Easing.Quadratic.Out).delay(1000).start();
			}
		};

		addBackground(this.game, this.isoGroup);
		this.game.iso.simpleSort(this.isoGroup);

		this.player.room.addItems(this.game);
		this.player.addSprite(this.game);

		// Set up our controls.
		this.game.cursors = this.game.input.keyboard.createCursorKeys();
		this.game.input.keyboard.addKeyCapture([
			Phaser.Keyboard.LEFT,
			Phaser.Keyboard.RIGHT,
			Phaser.Keyboard.UP,
			Phaser.Keyboard.DOWN,
			Phaser.Keyboard.SPACEBAR
		]);
		this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(function() {
			//this.player.toggleBlur(this.game);
			//explode(this.game, -1, 1);
			console.log(this.player.pos);
		}, this);
	},

	update: function() {
		this.player.update(this.game);
	},

	gameResized: function (width, height) {
	},

	enterIncorrectOrientation: function () {

		Identify.orientated = false;

		document.getElementById('orientation').style.display = 'block';

	},

	leaveIncorrectOrientation: function () {

		Identify.orientated = true;

		document.getElementById('orientation').style.display = 'none';

	}
};