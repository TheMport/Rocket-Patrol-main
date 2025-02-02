class Play extends Phaser.Scene {
  constructor() {
    super("playScene");


    this.currentPlayer = 1; //start with player 1
    this.timer = 0; //set timer to 0
    this.isP1Turn = true; 
    this.showGameOverP1Text = false;  //hide game over text
    this.showPressJToStartP2Text = false; //restart game for p2
    this.p2Flag = false;  //flag for p2 to then start their turn
  }

  init(data) {
    this.timer = data.gameTimer;
  }

  create() {
    let gameOverConfig = {
      fontFamily: "Courier",
      fontSize: "28px",
      backgroundColor: "#F3B141",
      color: "#843605",
      align: "center",
      padding: {
        top: 5,
        bottom: 5,
      },
      fixedWidth: 0,
    };

    //place tile sprite
    this.starfield = this.add
      .tileSprite(0, 0, 640, 480, "starfield")
      .setOrigin(0, 0);

    // green UI background
    this.add
      .rectangle(
        0,
        borderUISize + borderPadding,
        game.config.width,
        borderUISize * 2,
        0x00ff00
      )
      .setOrigin(0, 0);
    // white borders
    this.add
      .rectangle(0, 0, game.config.width, borderUISize, 0xffffff)
      .setOrigin(0, 0);
    this.add
      .rectangle(
        0,
        game.config.height - borderUISize,
        game.config.width,
        borderUISize,
        0xffffff
      )
      .setOrigin(0, 0);
    this.add
      .rectangle(0, 0, borderUISize, game.config.height, 0xffffff)
      .setOrigin(0, 0);
    this.add
      .rectangle(
        game.config.width - borderUISize,
        0,
        borderUISize,
        game.config.height,
        0xffffff
      )
      .setOrigin(0, 0);
    //keybind definitions
    this.keyFIRE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.keyRESET = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.R
    );
    this.keyLEFT = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.LEFT
    );
    this.keyRIGHT = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.RIGHT
    );
    this.keyP2turn = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.J
    );

    this.gameOver = false; 

    // Display timer for both players (initially showing only player 1's timer)
    this.timerP1Text = this.add.text(
      200,
      55,
      "P1 Time: " + this.formatTime(this.timer),
      { font: "28px Courier", fill: "#ffffff" }
    );
    this.timerP2Text = this.add.text(
      200,
      55,
      "P2 Time: " + this.formatTime(this.timer),
      { font: "28px Courier", fill: "#ffffff" }
    );
    this.timerP2Text.setVisible(false); // Hide P2 timer initially

    // Game over text for P1
    this.gameOverP1Text = this.add
      .text(
        this.game.config.width / 2,
        this.game.config.height / 2,
        "P1 GAME OVER",
        gameOverConfig
      )
      .setOrigin(0.5);
    this.gameOverP1Text.setVisible(false);

    // Press J to start P2 turn text
    this.pressJToStartP2Text = this.add
      .text(
        this.game.config.width / 2,
        this.game.config.height / 2 + 64,
        "Press (J) to start P2",
        gameOverConfig
      )
      .setOrigin(0.5);
    this.pressJToStartP2Text.setVisible(false);

    //p1 & p2 rockets
    //add rocket to p1
    this.rocket = new Rocket(
      this,
      game.config.width / 2,
      game.config.height - borderUISize - borderPadding,
      "rocket"
    ).setOrigin(0.5, 0);


    //initialize score
    this.p1Score = 0;
    this.p2Score = 0;
    this.gameHighScore = 0;
    this.currentHighScore = 0;
    this.highScore = 0;

    // add spaceships (x3)
    this.ship01 = new Spaceship(
      this,
      game.config.width + borderUISize * 6,
      borderUISize * 4,
      "spaceship",
      0,
      30
    ).setOrigin(0, 0);
    this.ship02 = new Spaceship(
      this,
      game.config.width + borderUISize * 3,
      borderUISize * 5 + borderPadding * 2,
      "spaceship",
      0,
      20
    ).setOrigin(0, 0);
    this.ship03 = new Spaceship(
      this,
      game.config.width,
      borderUISize * 6 + borderPadding * 4,
      "spaceship",
      0,
      10
    ).setOrigin(0, 0);

    // display score
    let scoreConfig = {
      fontFamily: "Courier",
      fontSize: "28px",
      backgroundColor: "#F3B141",
      color: "#843605",
      align: "right",
      padding: {
        top: 5,
        bottom: 5,
      },
      fixedWidth: 100,
    };
    //display p1 score on the left
    this.scoreLeft = this.add.text(
      borderUISize + borderPadding,
      borderUISize + borderPadding * 2,
      this.p1Score,
      scoreConfig
    );

    //display p2 score on the right
    this.scoreRight = this.add
      .text(
        borderUISize + borderPadding,
        borderUISize + borderPadding * 2,
        this.p2Score,
        scoreConfig
      )
      .setOrigin(1, 0);

      //display high score "HS : (score)"
      this.highScore = this.add.text(
        game.config.width - borderUISize - borderPadding,
        borderUISize + borderPadding * 2,
        "HS: " + this.gameHighScore,
        scoreConfig
    ).setOrigin(1,0);

      //array to store different explosion sounds
      this.rngSounds = ['sfx-explosion01','sfx-explosion02','sfx-explosion03','sfx-explosion04','sfx-explosion05']

    // 60-second play clock
    scoreConfig.fixedWidth = 0;
    this.clock = this.time.delayedCall(
      game.settings.gameTimer,
      () => {

      },
      null,
      this
    );

    this.physics.add.collider(
      this.rocket,
      this.ship01,
      this.handleCollision,
      null,
      this
    );
    this.physics.add.collider(
      this.rocket,
      this.ship02,
      this.handleCollision,
      null,
      this
    );
    this.physics.add.collider(
      this.rocket,
      this.ship03,
      this.handleCollision,
      null,
      this
    );
  }


  update() {
    // Update timers for both players
    this.updateTimer();

    if (this.gameOver && Phaser.Input.Keyboard.JustDown(this.keyLEFT)) {
        this.scene.start("menuScene")
      }

    if(this.gameOver && Phaser.Input.Keyboard.JustDown(this.keyRESET)) {
        this.scene.restart()
    }

    // Base updates that are always active
    this.starfield.tilePositionX -= 4;
    this.ship01.update(); // Update spaceships
    this.ship02.update();
    this.ship03.update();
    this.rocket.update(
      this.currentPlayer,
      this.keyLEFT,
      this.keyRIGHT,
      this.keyFIRE
    );


    if (this.gameOver) {
      if (this.isP1Turn) {
        this.handlePlayerTurn();
        this.endP1Turn();
        this.startP2Turn();
      }else{ 
        this.handlePlayerTurn();
        this.endP2Turn();
      
    }
  }}


  handleCollision(rocket, ship) {
    rocket.reset();
    this.shipExplode(ship);

    //adding points per hit
    if (this.currentPlayer === 1) {
      // Handling collision
      this.p1Score += ship.points;
      this.scoreLeft.text = this.p1Score;
    } else {
      // Handling collision
      this.p2Score += ship.points;
      this.scoreRight.text = this.p2Score;
    }

    const currentHighScore = Math.max(this.p1Score, this.p2Score);
    if (currentHighScore > this.gameHighScore) {
        this.gameHighScore = currentHighScore;
        this.highScore.setText("HS: " + this.gameHighScore); //updates
    }

  }

  handlePlayerTurn() {
    this.updateTimer();

    // Handle input and updates for the current player
    if (this.currentPlayer === 1) {
      this.rocket.update();
    } else if (this.currentPlayer === 2) {
      this.rocket.update();
    }
  }

  formatTime(milliseconds) {
    // Convert milliseconds to seconds
    let seconds = Math.floor(milliseconds / 1000);

    // Convert seconds to minutes
    let minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;

    let formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    return formattedTime;
  }

  updateTimer() {
    // Reduce timer based on who's currently playing
    if (this.currentPlayer === 1 && this.timer > 0) {
      this.timer -= 1000 / 60;
      this.timerP1Text.setText("P1 Time: " + this.formatTime(this.timer));
      if (this.timer <= 0) {

        this.endP1Turn();
      }
    } else if (this.currentPlayer === 2 && this.timer > 0) {
      this.timer -= 1000 / 60;
      this.timerP2Text.setText("P2 Time: " + this.formatTime(this.timer));
      if (this.timer <= 0) {

        this.endP2Turn();
      }
    }
  }

  PlayRngSounds(){
    const randomSound = Phaser.Utils.Array.GetRandom(this.rngSounds);
    this.sound.play(randomSound);
  }

  shipExplode(ship) {
    // temporarily hide ship
    ship.alpha = 0;
    // create explosion sprite at ships position
    let boom = this.add.sprite(ship.x, ship.y, "explosion").setOrigin(0, 0);
    boom.anims.play("explode"); // play explode animation
    boom.on("animationcomplete", () => {

      ship.reset(); // reset ship position
      ship.alpha = 1; // make ship visible again
      boom.destroy(); // remove explosion sprite
      this.timer += 5000; // Add 5 seconds to players timer

      this.PlayRngSounds(); //to let player know time was added
    });
  }

  startP1Turn() {
    this.currentPlayer = 1;
    this.isP1Turn = true;

    this.timerP1Text.setVisible(true);
    this.timer = this.initialTimerValue;

    // toggle off p2
    this.timerP2Text.setVisible(false);
  }

  endP1Turn() {

    let gameOverConfig = {
      fontFamily: "Courier",
      fontSize: "28px",
      backgroundColor: "#F3B141",
      color: "#843605",
      align: "center",
      padding: {
        top: 5,
        bottom: 5,
      },
      fixedWidth: 0,
    };

    // Toggle to player 2
    this.p2Flag = true;
    this.currentPlayer = 2;

    //ui update
    this.timerP1Text.setVisible(false);
    this.timerP2Text.setVisible(true);

    this.showGameOverP1Text = true;
    this.showPressJToStartP2Text = true;

    this.gameOverP1Text.setVisible(this.showGameOverP1Text);
    this.pressJToStartP2Text.setVisible(this.showPressJToStartP2Text);

    // Listen for 'J' key press to start P2's turn
    this.keyP2turn.once("down", () => {
      this.pressJToStartP2Text.setVisible(false);
      this.pressJToStartP2Text.setVisible(false);
      this.startP2Turn();
    });
  }

  startP2Turn() {

    if(!this.p2Flag) 
      return;

    this.gameOver = false;
    this.p2Flag = false;
    this.isP1Turn = false;
    this.currentPlayer = 2;

    this.rocket.setPosition(
      game.config.width / 2,
      game.config.height - borderUISize - borderPadding
    );


    //toggle p2
    this.timer = game.settings.gameTimer; 
    this.timerP2Text.setVisible(true); 

    //toggle off p1
    this.timerP1Text.setVisible(false);
    this.gameOverP1Text.setVisible(false);
    this.pressJToStartP2Text.setVisible(false);
  }

  endP2Turn() {
    this.gameOver = true;

    // Display game over message for P2 and option to restart
    let gameOverConfig = {
      fontFamily: "Courier",
      fontSize: "28px",
      backgroundColor: "#F3B141",
      color: "#843605",
      align: "center",
      padding: {
        top: 5,
        bottom: 5,
      },
      fixedWidth: 0,
    };
    this.add
      .text(
        this.game.config.width / 2,
        this.game.config.height / 2,
        "P2 GAME OVER",
        gameOverConfig
      )
      .setOrigin(0.5);
    this.add
      .text(
        this.game.config.width / 2,
        this.game.config.height / 2 + 64,
        "Press (R) to Restart or ← for Menu",
        gameOverConfig
      )
      .setOrigin(0.5);

    this.timerP2Text.setVisible(false);

    this.pressJToStartP2Text.setVisible(true);
    this.keyP2turn.once("down", () => {
      this.pressJToStartP2Text.setVisible(false);
      this.startP2Turn();
    });
  }
}
