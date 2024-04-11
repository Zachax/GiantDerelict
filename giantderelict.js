document.addEventListener('DOMContentLoaded', () => {
    const app = new PIXI.Application({ width: 800, height: 600, backgroundColor: 0x1099bb });
    document.getElementById('pixi-container').appendChild(app.view);
    
    const graphics = new PIXI.Graphics();
    graphics.beginFill(0xFF0000);
    graphics.drawRect(0, 0, 100, 100);
    graphics.endFill();
    
    app.stage.addChild(graphics);
    
    // Create a sprite
    const ball = PIXI.Sprite.from('https://pixijs.io/examples/examples/assets/bunny.png');
    ball.anchor.set(0.5);
    ball.x = app.screen.width / 2;
    ball.y = app.screen.height / 2;
    ball.vx = 5;
    ball.vy = 5;
    app.stage.addChild(ball);
    
    // Define initial velocity
    const speed = 5;
    let velocityX = 0;
    let velocityY = 0;
    
    // Handle keyboard input
    const keys = {};
    document.addEventListener('keydown', (event) => {
        keys[event.key] = true;
    });
    document.addEventListener('keyup', (event) => {
        keys[event.key] = false;
    });
    
    // Animation loop
    app.ticker.add(() => {
        // Update ball position based on keyboard input
        if (keys['ArrowLeft']) {
            velocityX = -speed;
        } else if (keys['ArrowRight']) {
            velocityX = speed;
        } else {
            velocityX = 0;
        }
        if (keys['ArrowUp']) {
            velocityY = -speed;
        } else if (keys['ArrowDown']) {
            velocityY = speed;
        } else {
            velocityY = 0;
        }
        
        // Update the position of the sprite
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
