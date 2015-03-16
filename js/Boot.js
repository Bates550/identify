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
		this.game.load.image('edge_right', 'images/edge_right.png');
		this.game.load.image('edge_down', 'images/edge_down.png');
		this.game.load.image('arrow_up', 'images/arrow_up.png');
		this.game.load.image('arrow_right', 'images/arrow_right.png');
		this.game.load.image('arrow_down', 'images/arrow_down.png');
		this.game.load.image('arrow_left', 'images/arrow_left.png');
		this.game.load.spritesheet('player', 'images/lucas_walk.png', 72, 112);
		this.game.load.spritesheet('player_blurry', 'images/lucas_walk_blurry.png', 36, 56);
		this.game.load.spritesheet('player_blurriest', 'images/lucas_walk_blurriest.png', 18, 28);
		this.game.plugins.add(new Phaser.Plugin.Isometric(this.game));
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
			blur: 'blurriest',
			move: function(dir) {
				if (
					dir === 'up' && this.pos.y !== -1 ||
					dir === 'right' && this.pos.x !== 1 ||
					dir === 'down' && this.pos.y !== 1 ||
					dir === 'left' && this.pos.x !== -1) {
					this.moving = { value: true, timer: 35, dir: dir}; // 35 is a magic number
					this.sprite.animations.play(this.moving.dir);
				}
			},
			fps: 6,
			direction: 'down',
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
			},
			toggleBlur: function(game) {
				if (this.blur === 'none') { this.blur = 'blurriest'; }
				else if (this.blur === 'blurriest') { this.blur = 'blurry'; }
				else { this.blur = 'none'; }
				this.addSprite(game);
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

		var edge;
		edge = this.game.add.isoSprite(192, 64, 0, 'edge_right', 0, this.isoGroup);
		edge.anchor.set(0.5);
		edge.scale.set(1.6);
		edge = this.game.add.isoSprite(64, 192, 0, 'edge_down', 0, this.isoGroup);
		edge.anchor.set(0.5);
		edge.scale.set(1.6);

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
		this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(function() {
			this.player.toggleBlur(this.game);
		}, this);;
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