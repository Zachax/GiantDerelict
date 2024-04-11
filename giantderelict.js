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
    app.stage.addChild(ball);  
    
    // Define initial velocity
    const speed = 5;
    let velocityX = 5;
    let velocityY = 5;
    
    // Handle keyboard input
    const keys = {};
    document.addEventListener('keydown', (event) => {
        keys[event.key] = true;
        console.log('Key pressed:', event.key);
    });
    document.addEventListener('keyup', (event) => {
        keys[event.key] = false;
        console.log('Key released:', event.key);
    });

    // Handle touch input for mobile devices
    document.addEventListener('touchstart', (event) => {
        const touch = event.touches[0];
        handleTouchInput(touch);
    });

    document.addEventListener('touchmove', (event) => {
        event.preventDefault(); // Prevent scrolling the page while moving the touch
        const touch = event.touches[0];
        handleTouchInput(touch);
    });

    document.addEventListener('touchend', () => {
        handleTouchEnd();
    });

    // Function to handle keyboard and touch input
    function handleKeyboardInput() {
        // Update ball velocity based on keyboard input
        velocityX = (keys['ArrowRight'] ? speed : 0) - (keys['ArrowLeft'] ? speed : 0);
        velocityY = (keys['ArrowDown'] ? speed : 0) - (keys['ArrowUp'] ? speed : 0);
    }

    function handleTouchInput(touch) {
        // Update ball position based on touch input
        // Example: Update ball position based on touch position
        ball.x = touch.clientX;
        ball.y = touch.clientY;
    }

    function handleTouchEnd() {
        // Additional logic for touch end event if needed
    }
    
    // Animation loop
    app.ticker.add(() => {
        // Update the position of the sprite
        ball.x += velocityX;
        ball.y += velocityY;

        // Reverse direction if the ball reaches the screen edges (this doesn't work currently with the controller scheme thing)
        if (ball.x + ball.width / 2 >= app.screen.width || ball.x - ball.width / 2 <= 0) {
            ball.velocityX *= -1;
        }
        if (ball.y + ball.height / 2 >= app.screen.height || ball.y - ball.height / 2 <= 0) {
            ball.velocityY *= -1;
        }
    });
});
