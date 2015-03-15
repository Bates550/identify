
Identify.MainMenu = function (game) {


};

Identify.MainMenu.prototype = {

	create: function () {

		// this.music = this.add.audio('titleMusic');
		// this.music.play();

        this.add.image(0, 116, 'intro');

	    this.title = this.add.bitmapText(640/2-200, 170, 'adventure', 'Identify!', 100);
	    this.rules = this.add.bitmapText(640/2-220, 400, 'adventure', 'Move boulders and try to get to the green.\nClick to start.\nArrow keys to move.\nQ to quit. R to restart.')
	    this.rules.align = 'center';
        this.input.onDown.addOnce(this.startGame, this);

	},

	update: function () {

	},

	startGame: function (pointer) {

		// this.music.stop();

		//	And start the actual game
		this.state.start('Game');

	}

};
