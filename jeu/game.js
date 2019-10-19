window.addEventListener('load', () => {
    startGame();
});

function Ground(x, y, width, height, color) {
    this.width = width,
        this.height = height,
        this.color = color,
        this.draw = function(ctx) {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, width, height);
        }
}

function startGame() {
    const canvas = document.getElementById('sauve-la-planete');

    const ctx = canvas.getContext('2d');

    //Le sol
    const ground = new Ground(0, 200, 400, 200, "red");
    ground.draw(ctx);
}