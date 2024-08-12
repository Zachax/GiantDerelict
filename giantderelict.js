document.addEventListener('DOMContentLoaded', () => {
    const screenWidth = 800;
    const screenHeight = 600;
    const app = new PIXI.Application({ width: screenWidth, height: screenHeight, backgroundColor: 0x1099bb });
    document.getElementById('pixi-container').appendChild(app.view);
    
    const graphics = new PIXI.Graphics();
    graphics.beginFill(0xFF0000);
    graphics.drawRect(0, 0, 100, 100);
    graphics.endFill();
    app.stage.addChild(graphics);

    // Define the size of each cell
    let cellSize = 50;
    
    // Create a sprite
    const player = PIXI.Sprite.from('https://pixijs.io/examples/examples/assets/bunny.png');
    player.anchor.set(0.5);
    //player.x = app.screen.width / 2;
    //player.y = app.screen.height / 2;
    //app.stage.addChild(player);  
    
    // Define initial velocity
    const speed = cellSize;
    let velocityX = 5;
    let velocityY = 5;

    // Generate level
    const levelXsize = 10;
    const levelYsize = 10;
    let level = Array.from({ length: levelXsize }, () => new Array(levelYsize).fill(0));
    // demo level
    level = [
        ['0', '0', '0', '0', 'X', 'X', 'X', 'X', '0', '0'],
        ['0', 'X', 'X', 'X', 'X', '0', '0', 'X', '0', '0'],
        ['0', 'X', '0', '0', '0', '0', '0', 'X', '0', '0'],
        ['0', 'X', '0', '0', '0', '0', '0', 'X', 'X', 'X'],
        ['0', 'X', 'X', '0', '0', '0', '0', '0', '0', '0'],
        ['0', '0', 'X', '0', '0', '0', '0', '0', '0', '0'],
        ['0', '0', 'X', '0', '0', '0', '0', '0', '0', '0'],
        ['0', '0', 'X', 'X', 'X', 'X', '0', '0', '0', '0'],
        ['0', '0', '0', '0', '0', 'X', '0', '0', '0', '0'],
        ['0', '0', '0', '0', '0', 'X', '0', '0', '0', '0']
      ];

    // Create a container to hold the grid
    let levelContainer = new PIXI.Container();
    app.stage.addChild(levelContainer);
    
    // Loop through the array and create a rectangle for each element
    for (let row = 0; row < level.length; row++) {
        for (let col = 0; col < level[row].length; col++) {
            // Create a new graphics object for the cell
            let cell = new PIXI.Graphics();

            // Set the color based on the array value
            let color = level[row][col] === 'X' ? 0xff0000 : 0xffffff; // Red for 'X', white for '0'

            // Draw the rectangle
            cell.beginFill(color);
            cell.drawRect(col * cellSize, row * cellSize, cellSize, cellSize);
            cell.endFill();

            // Add the rectangle to the container
            levelContainer.addChild(cell);
        }
    }

    // Map location on the UI
    let bounds = levelContainer.getLocalBounds();
    levelContainer.x = screenWidth-bounds.width;
    levelContainer.y = screenHeight-bounds.height;

    // Add player on the map
    player.x = levelContainer.width - cellSize / 2;
    player.y = levelContainer.height - cellSize / 2;
    levelContainer.addChild(player);
        
    // Handle keyboard input
    const keys = {};
    document.addEventListener('keydown', (event) => {
        keys[event.key] = true;
        //console.log('Key pressed:', event.key);
    });
    document.addEventListener('keyup', (event) => {
        keys[event.key] = false;
        //console.log('Key released:', event.key);
        // Check which key was released and move the player accordingly
        if (event.code === 'ArrowUp') {
            player.y -= cellSize;
        }
        if (event.code === 'ArrowDown') {
            player.y += cellSize;
        }
        if (event.code === 'ArrowLeft') {
            player.x -= cellSize;
        }
        if (event.code === 'ArrowRight') {
            player.x += cellSize;
        }
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
});
