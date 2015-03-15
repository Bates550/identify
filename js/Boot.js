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
		this.game.load.spritesheet('player', 'images/lucas_walk.png', 72, 112)
		this.game.plugins.add(new Phaser.Plugin.Isometric(this.game))
		this.game.iso.anchor.setTo(0.5, 0.5);
	},

	create: function () {
		this.isoGroup = this.game.add.group();

		this.player = {
			pos: { x: 0, y: 0 },
			moving: {
				value: false,
				timer: 0,
				dir: undefined
			},
			move: function(dir) {
				this.moving = { value: true, timer: 35, dir: dir}; // 35 is a magic number
				this.sprite.animations.play(this.moving.dir);
			},
			fps: 6,
			direction: 'down',
			addSprite: function(game) {
				this.sprite = game.add.isoSprite(17, 17, 0, 'player', 3) // 17 is a magic number
				this.sprite.anchor.set(0.5);
				this.sprite.animations.add('up', [19, 18, 20, 18], this.fps, false)
				this.sprite.animations.add('right', [7, 6, 8, 6], this.fps, false)
				this.sprite.animations.add('down', [4, 3, 5, 3], this.fps, false)
				this.sprite.animations.add('left', [16, 15, 17, 15], this.fps, false)
			},
			update: function(game) {
				var speed = 2; // 2 is a magic number
				// If the player is not in already in the process of moving
				if (!this.moving.value) {
					if (game.cursors.up.isDown) {
						this.move('up');
					}
					else if (game.cursors.right.isDown) {
						this.move('right');
					}
					else if (game.cursors.down.isDown) {
						this.move('down');
					}
					else if (game.cursors.left.isDown) {
						this.move('left');
					}
				}
				// Else the player is in the process of moving
				else {
					// If they're done moving
					if (--this.moving.timer <= 0) {
						//this.player.doMove()
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
						//console.log('hi');
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
			}
		};
		this.player.addSprite(this.game);

		var tile;
		for (var x = 0; x < 192; x += 64) {
			for (var y = 0; y < 192; y += 64) {
				tile = this.game.add.isoSprite(x, y, 0, 'tile', 0, this.isoGroup);
				tile.anchor.set(0.5);
				tile.scale.set(1.6);
			}
		}

		this.game.iso.simpleSort(this.isoGroup);

		// Set up our controls.
		this.game.cursors = this.game.input.keyboard.createCursorKeys();
		this.game.input.keyboard.addKeyCapture([
			Phaser.Keyboard.LEFT,
			Phaser.Keyboard.RIGHT,
			Phaser.Keyboard.UP,
			Phaser.Keyboard.DOWN,
			Phaser.Keyboard.SPACEBAR
		]);
	},

	update: function() {
		//var speed = 2; // 2 is a magic number
		this.player.update(this.game);
		// If the player is not in already in the process of moving
		/*if (!this.player.moving.value) {
			if (this.game.cursors.up.isDown) {
				this.player.move('up');
			}
			else if (this.game.cursors.right.isDown) {
				this.player.move('right');
			}
			else if (this.game.cursors.down.isDown) {
				this.player.move('down');
			}
			else if (this.game.cursors.left.isDown) {
				this.player.move('left');
			}
		}
		// Else the player is in the process of moving
		else {
			// If they're done moving
			if (--this.player.moving.timer <= 0) {
				//this.player.doMove()
				switch(this.player.moving.dir) {
					case 'up':
						this.player.pos = { x: this.player.pos.x, y: this.player.pos.y-1 };
						break;
					case 'right':
						this.player.pos = { x: this.player.pos.x+1, y: this.player.pos.y };
						break;
					case 'down':
						this.player.pos = { x: this.player.pos.x, y: this.player.pos.y+1 };
						break;
					case 'left':
						this.player.pos = { x: this.player.pos.x-1, y: this.player.pos.y };
						break;
				}
				this.player.moving.value = false;
			}
			// Else they're not done moving
			else {
				//console.log('hi');
				switch(this.player.moving.dir) {
					case 'up':
						this.player.sprite.isoY -= speed;
						break;
					case 'right':
						this.player.sprite.isoX += speed;
						break;
					case 'down':
						this.player.sprite.isoY += speed;
						break;
					case 'left':
						this.player.sprite.isoX -= speed;
						break;
				}
			}
		}
		//console.log(this.player.sprite.isoX, this.player.sprite.isoY);
		*/
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