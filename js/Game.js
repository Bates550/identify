
Identify.Game = function (game) {

    this.grid;

};

Identify.Game.prototype = {

	create: function () {
        this.lastUpdated = 0;
        this.cursors = this.input.keyboard.createCursorKeys();
        this.restart_key = this.input.keyboard.addKey(Phaser.Keyboard.R);
        this.quit_key = this.input.keyboard.addKey(Phaser.Keyboard.Q);

        this.spriteSize = 32; // px
        this.scale = 2;
        this.gridSize = 10;
        this.cellSize = this.spriteSize * this.scale;
        this.grid = [];
        this.rocks = []; // Array of 1D rock
        this.numRocks = 50;

        this.gameWon = false;

        /* Fill grid with gridSize^2 cell objects
         */
        for (var i=0; i < this.gridSize; i++) {
            this.grid.push([]);
            for (var j=0; j < this.gridSize; j++) {
                this.grid[i].push({holds: null});
            }
        }

        /* Fill tmp with numbers 0 through gridSize^2 
         */
        var tmp = [];
        for (var i=0; i < this.gridSize*this.gridSize; i++) {
            tmp.push(i);
        }

        /* Shuffle tmp and use first numRocks numbers contained as locations for rocks. 
         * Numbers given are 1D. 
         */
        tmp = shuffle(tmp);
        for (var i=0; i < this.numRocks; i++) {
            var rock = tmp.pop();
            this.rocks.push(rock);
        }
        console.assert(this.rocks.length == this.numRocks);

        /* Tile the ground to all columns in the grid except the rightmost one, which is the goal.
         */
        var groundCover = this.cellSize * (this.gridSize-1) 
        this.ground = this.add.tileSprite(0, 0, groundCover, groundCover, 'ground');
        this.ground.scale.setTo(this.scale, this.scale);

        for (var i=0; i < this.gridSize; i++) {
            var tmpSprite = this.add.sprite(this.cellSize*(this.gridSize-1), this.cellSize*i, 'goal');
            tmpSprite.scale.setTo(this.scale, this.for);
        }

        scale (var i=0; i < this.numRocks; i++) {
            var rockX = this.rocks[i]%this.gridSize;
            var rockY = Math.floor(this.rocks[i]/this.gridSize);
            this.grid[rockX][rockY] = this.add.sprite(rockX*this.cellSize, rockY*this.cellSize, 'rock');
            this.grid[rockX][rockY].holds = 'rock'
            this.grid[rockX][rockY].scale.setTo(this.scale, this.scale);
        }

        var start = tmp.pop();
        var startX = start%this.gridSize;
        var startY = Math.floor(start/this.gridSize);

        this.player = this.add.sprite(startX*this.cellSize, startY*this.cellSize, 'player');  
        this.player.scale.setTo(this.scale, this.scale);   

        this.playerGroup = this.add.group();

        this.playerLeft = this.playerGroup.create(startX*this.cellSize, startY*this.cellSize, 'playerLeft');
        this.playerRight = this.playerGroup.create(startX*this.cellSize, startY*this.cellSize, 'playerRight');
        this.playerUp = this.playerGroup.create(startX*this.cellSize, startY*this.cellSize, 'playerUp');
        this.playerDown = this.playerGroup.create(startX*this.cellSize, startY*this.cellSize, 'playerDown');

        this.playerGroup.setAll('visible', false);   
        this.playerGroup.setAll('scale.x', 2);
        this.playerGroup.setAll('scale.y', 2);

        // Fisher-Yates Shuffle
        // http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
        function shuffle(array) {
            var counter = array.length, temp, index;

            // While there are elements in the array
            while (counter > 0) {
                // Pick a random index
                index = Math.floor(Math.random() * counter);

                // Decrease counter by 1
                counter--;

                // And swap the last element with it
                temp = array[counter];
                array[counter] = array[index];
                array[index] = temp;
            }

            return array;
        }
	},

	update: function () {
        if (this.restart_key.isDown) {
            this.restartGame();
        }
        if (this.quit_key.isDown) {
            this.quitGame();
        }
        var gridX, gridY;
        if (this.lastUpdated++ > 5) {
            this.lastUpdated = 0;
            if (this.cursors.left.isDown) {
                this.playerLeft.visible = true;
                //if (this.grid[pixToGrid(this.player.x)-1][pixToGrid(this.player.y)] == null) {
                gridX = pixToGrid(this.player.x)-1;   
                gridY = pixToGrid(this.player.y);
                if (this.grid[gridX] !== undefined) {
                    if (this.grid[gridX][gridY].holds === null) {
                        this.player.x -= 64;
                        this.playerGroup.setAll('x', this.player.x);
                    }
                    else if (this.grid[gridX][gridY].holds === 'rock') {
                        if (this.grid[gridX-1] !== undefined) {
                            if (this.grid[gridX-1][gridY].holds === null) {
                                // Move rock
                                this.grid[gridX][gridY].x -= this.cellSize;
                                this.grid[gridX-1][gridY] = this.grid[gridX][gridY];
                                this.grid[gridX][gridY] = {holds: null};
                                // Move player
                                this.player.x -= this.cellSize;         
                                this.playerGroup.setAll('x', this.player.x);  
                            }            
                        }
                    }
                }
            }
            else if (this.cursors.right.isDown) {
                this.playerRight.visible = true;        
                gridX = pixToGrid(this.player.x)+1;   
                gridY = pixToGrid(this.player.y);
                if (this.grid[gridX] !== undefined) {
                    if (this.grid[gridX][gridY].holds === null) {
                        this.player.x += 64;
                        this.playerGroup.setAll('x', this.player.x);
                    }
                    else if (this.grid[gridX][gridY].holds === 'rock') {
                        if (this.grid[gridX+1] !== undefined) {
                            if (this.grid[gridX+1][gridY].holds === null) {
                                // Move rock
                                this.grid[gridX][gridY].x += this.cellSize;
                                this.grid[gridX+1][gridY] = this.grid[gridX][gridY];
                                this.grid[gridX][gridY] = {holds: null};
                                // Move player
                                this.player.x += this.cellSize;         
                                this.playerGroup.setAll('x', this.player.x);  
                            }            
                        }
                    }
                }
            }
            else if (this.cursors.up.isDown) {
                this.playerUp.visible = true;
                gridX = pixToGrid(this.player.x);   
                gridY = pixToGrid(this.player.y)-1;
                if (this.grid[gridX][gridY] !== undefined) {
                    if (this.grid[gridX][gridY].holds === null) {
                        this.player.y -= 64;
                        this.playerGroup.setAll('y', this.player.y);
                    }
                    else if (this.grid[gridX][gridY].holds === 'rock') {
                        if (this.grid[gridX][gridY-1] !== undefined) {
                            if (this.grid[gridX][gridY-1].holds === null) {
                                // Move rock
                                this.grid[gridX][gridY].y -= this.cellSize;
                                this.grid[gridX][gridY-1] = this.grid[gridX][gridY];
                                this.grid[gridX][gridY] = {holds: null};
                                // Move player
                                this.player.y -= this.cellSize;         
                                this.playerGroup.setAll('y', this.player.y);  
                            }
                        }
                    }
                }
            }
            else if (this.cursors.down.isDown) {
                this.playerDown.visible = true;
                gridX = pixToGrid(this.player.x);   
                gridY = pixToGrid(this.player.y)+1;
                if (this.grid[gridX][gridY] !== undefined) {
                    if (this.grid[gridX][gridY].holds === null) {
                        this.player.y += 64;
                        this.playerGroup.setAll('y', this.player.y);
                    }
                    else if (this.grid[gridX][gridY].holds === 'rock') {
                        if (this.grid[gridX][gridY+1] !== undefined) {
                            if (this.grid[gridX][gridY+1].holds === null) {
                                // Move rock
                                this.grid[gridX][gridY].y += this.cellSize;
                                this.grid[gridX][gridY+1] = this.grid[gridX][gridY];
                                this.grid[gridX][gridY] = {holds: null};
                                // Move player
                                this.player.y += this.cellSize;         
                                this.playerGroup.setAll('y', this.player.y);  
                            }
                        }
                    }
                }
            }
            else {
                this.playerGroup.setAll('visible', false);
            }
        }

        // Win condition
        if (pixToGrid(this.player.x) == 9) {
            this.state.start('Game');
        }

        function pixToGrid(x) {
            return (x / (32*2))%10;
        }
	},

	quitGame: function () {

		this.state.start('MainMenu');
	},

    restartGame: function() {
        this.state.start('Game');
    }

};
