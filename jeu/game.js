const WINDOW_WIDTH = 400;
const WINDOW_HEIGHT = 400;

const PLAYER_WIDTH = 32;
const PLAYER_HEIGHT = 32;

const GROUND_WIDTH = WINDOW_WIDTH - 100;
const GROUND_HEIGHT = 10;

const SEA_HEIGHT = 10;
const SEA_WIDTH = WINDOW_WIDTH;

let score = 0;
let _gameOver = false;

function Component(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.draw = function(ctx) {
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    this.newPos = function(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
    this.collision = function(c) {
        if (c.x + c.width < this.x || c.x > this.x + this.width ||
            c.y > this.y + this.height || c.y + c.height < this.y) {
            return false;
        } else {
            return true;
        }
    }
}

function Water(x, y, width, height, color) {
    this.component = new Component(x, y, width, height, color);
    this.up = function(dy) {
        this.component.y -= dy;
        this.component.height += 100;
    }
    this.draw = function(ctx) {
        this.component.draw(ctx);
    }
}

const actionsBad = [
    "nuclear", "car"
];

const actionsGood = [
    "solar", "velo"
];

const BAD = 0;
const GOOD = 1;
let waterUp = true;

function Action(x, y, width, height, color, type, image) {
    this.component = new Component(x, y, width, height, color);
    this.type = type;
    this.draw = function(ctx) {
        console.log(image);
        const di = document.getElementById(image);
        di.width = 32;
        di.height = 32;
        ctx.drawImage(di, this.component.x, this.component.y);
    }
    this.moveBottom = function() {
        this.component.newPos(0, 1);
        if (this.component.y > WINDOW_HEIGHT) {
            this.component.y = 0;
        }
    }
}

const LTR = 0;
const RTL = 1;

function Enemy(x, y, width, height, color, img, direction) {
    this.component = new Component(x, y, width, height, color);
    this.direction = direction;
    this.draw = function(ctx) {
        const image = document.getElementById(img);
        ctx.drawImage(image, this.component.x, this.component.y);
    }
    this.update = function() {
        if (this.direction == LTR) {
            this.component.newPos(3, 0);
            if (this.component.x + this.component.width >= WINDOW_WIDTH) {
                this.component.x = 0;
            }
        } else if (this.direction == RTL) {
            this.component.newPos(-3, 0);
            if (this.component.x + this.component.width < 0) {
                this.component.x = WINDOW_WIDTH + this.component.width
            }
        }
    }
}

function Player(x, y, width, height, color) {
    this.component = new Component(x, y, width, height, color);
    this.draw = function(ctx) {
        const image = document.getElementById('player');
        ctx.drawImage(image, this.component.x, this.component.y);
    }
    this.moveLeft = function() {
        this.component.newPos(-10, 0);
    }
    this.moveRight = function() {
        this.component.newPos(10, 0);
    }
    this.moveUp = function() {
        this.component.newPos(0, -10);
    }
    this.moveDown = function() {
        this.component.newPos(0, 10);
    }
}

function Game(ctx, ground, sea, player) {
    this.ctx = ctx;
    this.ground = ground;
    this.sea = sea;
    this.player = player;
    this.actions = [];
    this.enemy = [];
    this.initialize = function() {
        playerMoveInit(this.player);
        setInterval(() => {
            if (waterUp == true) {
                this.sea.up(1);
            }
            const type = Math.round(Math.random() * 1);
            const array = type == GOOD ? actionsGood : actionsBad;
            const imageIndex = Math.round(Math.random() * (array.length - 1));
            this.actions.push(new Action(Math.random() * WINDOW_WIDTH,
                0, 10, 10, type == GOOD ? "green" : "red", type, array[imageIndex]));
        }, 500);
    }
    this.isGameOver = function() {
        if (_gameOver)
            return true;
        _gameOver = this.player.component.y > this.sea.component.y;
        return _gameOver;
    }
    this.update = function() {
        if (!this.isGameOver()) {
            if (this.sea.component.y <= WINDOW_HEIGHT && this.enemy.length < 1) {
                const croco = new Enemy(0, WINDOW_HEIGHT - 32, 32, 32, "red", 'croco-ltr', LTR);
                this.enemy.push(croco);
            } else if (this.sea.component.y <= WINDOW_HEIGHT - 50 - 32 && this.enemy.length < 2) {
                const requin = new Enemy(WINDOW_WIDTH + 32, WINDOW_HEIGHT - 50, 32, 32, "red", 'requin-rtl', RTL);
                this.enemy.push(requin);
            }
            this.actions.forEach(a => {
                a.moveBottom();
                if (a.component.collision(this.player.component)) {
                    if (a.type == BAD) {
                        waterUp = true;
                    } else if (a.type == GOOD) {
                        score++;
                        waterUp = false;
                        displayScore();
                    }
                    for (let i = 0; i < this.actions.length; i++) {
                        if (a === this.actions[i]) {
                            this.actions.splice(i, 1);
                        }
                    }
                }
            });
            this.enemy.forEach(e => {
                e.update();
                if (e.component.collision(this.player.component)) {
                    _gameOver = true;
                }
            });
        } else {
            displayGameOver();
        }
    }

    this.render = function() {
        this.ctx.clearRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
        this.ctx.drawImage(document.getElementById('background-1'), 0, 0);
        this.actions.forEach(a => {
            a.draw(ctx);
        });
        this.enemy.forEach(e => {
            e.draw(ctx);
        })
        this.sea.draw(ctx);
        this.player.draw(ctx);
    }
}

function displayGameOver() {
    document.getElementById('game-over').innerHTML = "Game Over";
}

function displayScore() {
    document.getElementById('score').innerHTML = "Score: " + score;
}

function playerMoveInit(player) {
    window.addEventListener('keyup', (e) => {
        if (e.key === 'q') {
            if (player.component.x >= 0) {
                player.moveLeft();
            }
        } else if (e.key === 'd') {
            if (player.component.x + player.component.width < WINDOW_WIDTH) {
                player.moveRight();
            }
        } else if (e.key === 'z') {
            if (player.component.y >= WINDOW_HEIGHT - 150) {
                player.moveUp();
            }
        } else if (e.key === 's') {
            if (player.component.y + player.component.height < WINDOW_HEIGHT) {
                player.moveDown();
            }
        }
    });
}

const canvas = document.getElementById('sauve-la-planete');

const ctx = canvas.getContext('2d');
//Le sol
const ground = new Component((WINDOW_WIDTH - GROUND_WIDTH) / 2, WINDOW_HEIGHT, GROUND_WIDTH, GROUND_HEIGHT, "rgb(129,79,62)");
//L'ocean
const sea = new Water(0, WINDOW_HEIGHT - SEA_HEIGHT, SEA_WIDTH, SEA_HEIGHT, "rgba(0, 0, 255, 0.5)");
//Player
const player = new Player((WINDOW_WIDTH - PLAYER_WIDTH) / 2, WINDOW_HEIGHT - PLAYER_HEIGHT - GROUND_HEIGHT, PLAYER_WIDTH, PLAYER_HEIGHT, "rgb(0, 0, 0)");

const game = new Game(ctx, ground, sea, player);
game.initialize();

const animate = function() {
    requestAnimationFrame(animate);
    game.update();
    game.render();
}
animate();