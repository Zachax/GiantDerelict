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

    // Level blocks
    const blockFiller = '0';
    const blockOpen = 'X';
    const blockExit = '#';
    const blockStart = 'S';

    // Returns true if the coordinate location is open already.
    const isItFree = (level, x, y) => {
        if ((x >= 0 && x < level.length) && (y >= 0 && y < level[0].length)) {
            let content = level[x][y];
            return content === blockOpen ? true : false;
        } else {
            console.log('Function isItFree got overflow value');
            return false;
        }
    }

    // Returns coordinates for the first instance of desired block type
    // Returns null if none found
    const findBlock = (blockType, level) => {
        for (let i = 0; i < level.length; i++) {
            for (let j = 0; j < level[i].length; j++) {
                if (level[i][j] === blockType) {
                    return [ i, j ];
                }
            }
        }
        return null;
    }

    // Generate level
    const levelXsize = 10;
    const levelYsize = 10;
    
    const generateLevel = () => {
        let level = Array.from({ length: levelXsize }, () => new Array(levelYsize).fill(blockFiller));
        let startX = Math.floor(Math.random() * (levelXsize - 3) + 2); // Start location must not be at either Y wall
        let startY = 0;
        let x = startX;
        let y = startY;
        let overloadMax = 100; // fail-safe value, if there are over this many rounds the loop is terminated
        let count = 0;
        
        let attemptedBits;
        while (x > 0 && x < levelXsize-1 && y < levelYsize - 1 && count < overloadMax) {
            let direction = Math.floor(Math.random() * (4)); // 0 := up, 1 := right, 2 := down, 3 := left
            console.log('Random direction being: ' + direction);
            let failBit;
            switch (direction) {
                case 0:
                    if (y+1 == levelYsize-1) {
                        y++;
                    } else if (!isItFree(level, x, y+1)) {
                        y++;
                    } else {
                        failBit = 0b0001;
                    }
                    break;
                case 1:
                    if (x+1 == levelXsize-1) {
                        x++;
                    } else if (!isItFree(level, x+1, y)) {
                        x++;
                    } else {
                        failBit = 0b0010;
                    }
                    break;
                case 2:
                    if (y-1 > 1) { // It is not permitted to exit on bottom bar
                        if (!isItFree(level, x, y-1)) {
                            y--;
                        } else {
                            failBit = 0b0100;
                        }
                    } else {
                        failBit = 0b0100;
                    }
                    break;
                case 3:
                    if (x-1 == 0) {
                        x--;
                    } else if (!isItFree(level, x-1, y)) {
                        x--;
                    } else {
                        failBit = 0b1000;
                    }
                    break;
                default:
                    console.log('Level generation gave an invalid direction.');
            }
            if (x > 0 && x < levelXsize-1 && y < levelYsize-1) {
                if (isItFree(level, x, y)) {
                    console.log('Location ' + x + ':' + y + ' was already open, rolling again');
                } else {
                    level[x][y] = blockOpen;                    
                    console.log('Added open to ' + x + ':' + y);
                    attemptedBits = 0b0000;
                }
            } else {
                level[x][y] = blockExit;
                console.log('Added exit to ' + x + ':' + y);
                attemptedBits = 0b0000;
            }

            // Fail-safe, can't go to any direction anymore
            attemptedBits = attemptedBits | failBit;
            if (attemptedBits === 0b1111) {
                y = levelYsize-1;
                console.log('All directions are impossible, quitting');
            } else {
                console.log('Attempted bit is ' + attemptedBits + ' while failBit was ' + failBit);
            }

            count++;
            if (count >= overloadMax) {
                console.log('Overload');
            }
        }

        // Adding starter position last, because it might get overwritten during the generation
        level[startX][startY] = blockStart;
        console.log('Starter position is ' + x + ':' + y);
        return level;
    }
    
    let level = generateLevel();
    
    // demo level, rename to overwrite level if wanted to be used a fixed demo
    let levelx = [
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
            let color;
            if (level[row][col] === blockOpen) {
                color = 0xff0000; // Red for open
            } else if (level[row][col] === blockExit) {
                color = 0xff00ff;
            } else if (level[row][col] === blockStart) {
                color = 0x0a0afa;
            } else {
                color = 0xffffff; // white
            }

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
    playerStartCoordinates = findBlock(blockStart, level);
    player.x = cellSize / 2 + playerStartCoordinates[1] * cellSize;
    player.y = cellSize / 2 + playerStartCoordinates[0] * cellSize;
    //player.x = levelContainer.width - cellSize / 2; // Starts at right end
    //player.y = levelContainer.height -cellSize / 2; // Starts at bottom
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
