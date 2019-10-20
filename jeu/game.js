const WINDOW_WIDTH = 400;
const WINDOW_HEIGHT = 400;

const PLAYER_WIDTH = 32;
const PLAYER_HEIGHT = 32;

const GROUND_WIDTH = WINDOW_WIDTH - 100;
const GROUND_HEIGHT = 10;

const SEA_HEIGHT = 10;
const SEA_WIDTH = WINDOW_WIDTH;

let score = 0;

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
    "coca-cola", "petrol", "nuclear"
];

const actionsGood = [
    "solar"
];

const BAD = 0;
const GOOD = 1;

function Action(x, y, width, height, color, type, image) {
    this.component = new Component(x, y, width, height, color);
    this.type = type;
    this.draw = function(ctx) {
        console.log(image);
        ctx.drawImage(document.getElementById(image), this.x, this.y);
    }
    this.moveBottom = function() {
        this.component.newPos(0, 1);
        if (this.component.y > WINDOW_HEIGHT) {
            this.component.y = 0;
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
}

function Game(ctx, ground, sea, player) {
    this.ctx = ctx;
    this.ground = ground;
    this.sea = sea;
    this.player = player;
    this.actions = [];
    this.initialize = function() {
        playerMoveInit(this.player);
        setInterval(() => {
            const type = Math.round(Math.random() * 3);
            const array = type == GOOD ? actionsGood : actionsBad;
            const imageIndex = Math.round(Math.random() * array.length);
            console.log(imageIndex);
            this.actions.push(new Action(Math.random() * WINDOW_WIDTH,
                0, 10, 10, type == GOOD ? "green" : "red", type, type == GOOD ? actionsGood[imageIndex] : actionsBad[imageIndex]));
        }, 1000);
    }

    this.update = function() {
        this.actions.forEach(a => {
            a.moveBottom();
            if (a.component.collision(this.player.component)) {
                if (a.type == BAD) {
                    this.sea.up(1);
                } else if (a.type == GOOD) {
                    score++;
                    displayScore();
                }
                for (let i = 0; i < this.actions.length; i++) {
                    if (a === this.actions[i]) {
                        this.actions.splice(i, 1);
                    }
                }
            }
        });
    }

    this.render = function() {
        this.ctx.clearRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
        this.ctx.drawImage(document.getElementById('background-1'), 0, 0);
        this.actions.forEach(a => {
            a.draw(ctx);
        });
        this.sea.draw(ctx);
        this.player.draw(ctx);
    }
}

function displayScore() {
    document.getElementById('score').innerHTML = "Score: " + score;
}

function playerMoveInit(player) {
    window.addEventListener('keyup', (e) => {
        if (e.key === 'q') {
            player.moveLeft();
        } else if (e.key === 'd') {
            player.moveRight();
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