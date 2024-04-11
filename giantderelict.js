// script.js
alert('This is JavaScript from an external file running on GitHub Pages!');

document.addEventListener('DOMContentLoaded', () => {
    const app = new PIXI.Application({ width: 800, height: 600, backgroundColor: 0x1099bb });
    document.getElementById('pixi-container').appendChild(app.view);

    const graphics = new PIXI.Graphics();
    graphics.beginFill(0xFF0000);
    graphics.drawRect(0, 0, 100, 100);
    graphics.endFill();

    app.stage.addChild(graphics);

    // Create a ball sprite
    const ball = PIXI.Sprite.from('https://pixijs.io/examples/examples/assets/bunny.png');
    ball.anchor.set(0.5);
    ball.x = app.screen.width / 2;
    ball.y = app.screen.height / 2;
    ball.vx = 5;
    ball.vy = 5;
    app.stage.addChild(ball);

    // Animation loop
    app.ticker.add(() => {
        // Update the position of the ball
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Reverse direction if the ball reaches the screen edges
        if (ball.x + ball.width / 2 >= app.screen.width || ball.x - ball.width / 2 <= 0) {
            ball.vx *= -1;
        }
        if (ball.y + ball.height / 2 >= app.screen.height || ball.y - ball.height / 2 <= 0) {
            ball.vy *= -1;
        }
    });
});
