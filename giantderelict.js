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

    // Define a mobile calibration factor
    const calibrationFactor = 5; // Adjust as needed

    // Handle touch input for mobile devices
    let touchPosition = null; // Variable to store touch position
    document.addEventListener('touchstart', (event) => {
        const touch = event.touches[0];
        touchPosition = { x: touch.clientX, y: touch.clientY }; // Update touch position
    });

    document.addEventListener('touchmove', (event) => {
        event.preventDefault(); // Prevent scrolling the page while moving the touch
        const touch = event.touches[0];
        touchPosition = { x: touch.clientX, y: touch.clientY }; // Update touch position
    });

    document.addEventListener('touchend', () => {
        touchPosition = null; // Reset touch position
    });

    // Animation loop
    app.ticker.add(() => {
        // Handle keyboard input
        velocityX = (keys['ArrowRight'] ? speed : 0) - (keys['ArrowLeft'] ? speed : 0);
        velocityY = (keys['ArrowDown'] ? speed : 0) - (keys['ArrowUp'] ? speed : 0);

        // Handle touch input
        if (touchPosition) {
            // Calculate distance from touch position to ball
            const dx = touchPosition.x - ball.x;
            const dy = touchPosition.y - ball.y;
            // Move sprite towards touch position
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > calibrationFactor) { // Adjusted threshold for touch move
                // Adjust velocity based on touch position
                const absDx = Math.abs(dx);
                const absDy = Math.abs(dy);
                if (absDy > absDx) { // Adjust velocity only if the vertical distance is greater
                    const angle = Math.atan2(dy, dx);
                    velocityX = Math.cos(angle) * speed;
                    velocityY = Math.sin(angle) * speed;
                } else {
                    velocityX = 0;
                    // Move vertically only if the touch position is above or below the sprite
                    if (touchPosition.y < ball.y) {
                        velocityY = -speed;
                    } else if (touchPosition.y > ball.y) {
                        velocityY = speed;
                    }
                }
            } else {
                velocityX = 0;
                velocityY = 0;
            }
        }
        
        // Update the position of the sprite
        ball.x += velocityX;
        ball.y += velocityY;

        // Reverse direction if the ball reaches the screen edges
        if (ball.x + ball.width / 2 >= app.screen.width || ball.x - ball.width / 2 <= 0) {
            velocityX *= -1;
        }
        if (ball.y + ball.height / 2 >= app.screen.height || ball.y - ball.height / 2 <= 0) {
            velocityY *= -1;
        }
    });
});
