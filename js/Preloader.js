
Identify.Preloader = function (game) {

	this.background = null;
	//this.preloadBar = null;

	this.ready = false;

};

Identify.Preloader.prototype = {

	preload: function () {

		this.load.image('player', 'images/player.png');
		this.load.image('playerLeft', 'images/playerLeft.png');
		this.load.image('playerRight', 'images/playerRight.png');
		this.load.image('playerUp', 'images/playerUp.png');
		this.load.image('playerDown', 'images/playerDown.png');
		this.load.image('rock', 'images/rock.png');
		this.load.image('ground', 'images/ground.png');
		this.load.image('goal', 'images/goal.png');
		this.load.image('intro','images/intro.png');


		this.load.bitmapFont('adventure', 'images/adventure_0.png', 'images/adventure.fnt');

	},

	create: function () {

		//this.preloadBar.cropEnabled = false;

		this.state.start('MainMenu');

	},

	update: function () {

		// if (this.cache.isSoundDecoded('titleMusic') && this.ready == false)
		// {
			// this.ready = true;
			// this.state.start('MainMenu');
		// }

	}

};
