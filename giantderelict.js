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
    const cellSize = 50;

    // Create Direction "enum"
    const Direction = {
        Up: 'Up',
        Down: 'Down',
        Left: 'Left',
        Right: 'Right'
    };
    
    // Init player
    const player = {
        sprite: PIXI.Sprite.from('arrow.png'),
        heading: Direction.Right,
        x: 0,
        y: 0
    };
    
    // Init player location anchoring
    player.sprite.anchor.set(0.5);
    //player.x = app.screen.width / 2;
    //player.y = app.screen.height / 2;

    // Create a text object for coordinates
    const style = new PIXI.TextStyle({
        fontSize: 24,
        fill: "black",
        fontFamily: "Arial"
    });
    const coordinatesText = new PIXI.Text("Player Coordinates: (0, 0)", style);
    coordinatesText.x = 100;  // Position on the canvas
    coordinatesText.y = 10;
    app.stage.addChild(coordinatesText);

    // Update the text to display player coordinates
    function updateCoordinatesOnScreen(x, y) {
        coordinatesText.text = `Player Coordinates: (${x}, ${y})`;
        //console.log("Player coordinates are: " + x + " " + y);
    }    

    // Level blocks
    const BLOCK_FILLER = '0';
    const BLOCK_OPEN = 'X';
    const BLOCK_EXIT = '#';
    const BLOCK_START = 'S';

    // Returns true if the coordinate location is open already.
    // By default just checking for open squares (eg. for map generation), but with checkAllTypes can check if it's any valid movable piece
    const isItFree = (level, x, y, checkAllTypes = false, checkType = BLOCK_OPEN) => {
        if ((x >= 0 && x < level.length) && (y >= 0 && y < level[0].length)) {
            let content = level[x][y];
            console.log("Checked this tile content: " + content + " (" + x + ":" + y + ")"); // Debug
            if (checkAllTypes) {
                return (content === BLOCK_OPEN || content === BLOCK_EXIT || content === BLOCK_START) ? true : false;
            } else {
                return (content === checkType) ? true : false;
            }
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
        let level = Array.from({ length: levelXsize }, () => new Array(levelYsize).fill(BLOCK_FILLER));
        let startX = Math.floor(Math.random() * (levelXsize - 3) + 2); // Start location must not be at either Y wall
        let startY = 0;
        let x = startX;
        let y = startY;
        let overloadMax = 100; // fail-safe value, if there are over this many rounds the loop is terminated
        let count = 0;
        
        let attemptedBits;
        // Silly algorithm to generate a random level "worm"
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
                    level[x][y] = BLOCK_OPEN;                    
                    console.log('Added open to ' + x + ':' + y);
                    attemptedBits = 0b0000;
                }
            } else {
                level[x][y] = BLOCK_EXIT;
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
        level[startX][startY] = BLOCK_START;
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

    // Debugging show level data
    console.log(level);
    
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
            if (level[row][col] === BLOCK_OPEN) {
                color = 0xff0000; // Red for open
            } else if (level[row][col] === BLOCK_EXIT) {
                color = 0xff00ff;
            } else if (level[row][col] === BLOCK_START) {
                color = 0x0a0afa;
            } else {
                color = 0xffffff; // white
            }

            // Draw the rectangle
            cell.beginFill(color);
            cell.drawRect(row * cellSize, col * cellSize, cellSize, cellSize);
            cell.endFill();

            // Add the rectangle to the container
            levelContainer.addChild(cell);
        }
    }

    // Map location on the UI
    let bounds = levelContainer.getLocalBounds();
    levelContainer.x = screenWidth-bounds.width;
    levelContainer.y = screenHeight-bounds.height;

    // Add player and possibly else on the map
    playerStartCoordinates = findBlock(BLOCK_START, level);
    //player.x = levelContainer.width - cellSize / 2; // Starts at right end
    //player.y = levelContainer.height -cellSize / 2; // Starts at bottom
    levelContainer.addChild(player.sprite);

    // Init player location
    player.x = playerStartCoordinates[0];
    player.y = playerStartCoordinates[1];
    
    // Align map unit rotation by heading, the piece is for example the player
    const rotatePiece = (piece) => {
        switch (piece.heading) {
            case Direction.Up:
                piece.sprite.rotation = 3 * Math.PI / 2; // Up in radians, similarly with subsequent values
                break;
            case Direction.Down:
                piece.sprite.rotation = Math.PI / 2;
                break;
            case Direction.Left:
                piece.sprite.rotation = Math.PI;
                break;
            case Direction.Right:
                piece.sprite.rotation = 0;
                break;
        }
    };

    // Add to update loop:
    app.ticker.add(() => {
        rotatePiece(player);
        updateCoordinatesOnScreen(player.x, player.y);
        player.sprite.x = cellSize / 2 + player.x * cellSize;
        player.sprite.y = cellSize / 2 + player.y * cellSize;
    });
       
    // Player or other piece movement functions
    const moveForward = (piece) => {
        let newAxisObjective; // The new location on the axis that is wanted to be changed to
        switch (piece.heading) {
            case Direction.Up:
                newAxisObjective = piece.y - 1;
                //piece.sprite.y -= cellSize;
                if (isItFree(level, piece.x, newAxisObjective, true)) {
                    piece.y = newAxisObjective;
                }
                break;
            case Direction.Down:
                newAxisObjective = piece.y + 1;
                //piece.sprite.y += cellSize;
                if (isItFree(level, piece.x, newAxisObjective, true)) {
                    piece.y = newAxisObjective;
                }
                break;
            case Direction.Left:
                newAxisObjective = piece.x - 1;
                //piece.sprite.x -= cellSize;
                if (isItFree(level, newAxisObjective, piece.y, true)) {
                    piece.x = newAxisObjective;
                }
                break;
            case Direction.Right:
                newAxisObjective = piece.x + 1;
                //piece.sprite.x += cellSize;
                if (isItFree(level, newAxisObjective, piece.y, true)) {
                    piece.x = newAxisObjective;
                }
                break;
        }
    };

    const turnBack = (piece) => {
        switch (piece.heading) {
            case Direction.Up:
                piece.heading = Direction.Down;
                break;
            case Direction.Down:
                piece.heading = Direction.Up;
                break;
            case Direction.Left:
                piece.heading = Direction.Right;
                break;
            case Direction.Right:
                piece.heading = Direction.Left;
                break;
        }
    };

    const turnLeft = (piece) => {
        switch (piece.heading) {
            case Direction.Up:
                piece.heading = Direction.Left;
                break;
            case Direction.Down:
                piece.heading = Direction.Right;
                break;
            case Direction.Left:
                piece.heading = Direction.Down;
                break;
            case Direction.Right:
                piece.heading = Direction.Up;
                break;
        }
    };

    const turnRight = (piece) => {
        switch (piece.heading) {
            case Direction.Up:
                piece.heading = Direction.Right;
                break;
            case Direction.Down:
                piece.heading = Direction.Left;
                break;
            case Direction.Left:
                piece.heading = Direction.Up;
                break;
            case Direction.Right:
                piece.heading = Direction.Down;
                break;
        }
    };

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
            moveForward(player);
        }
        if (event.code === 'ArrowDown') {
            turnBack(player);
        }
        if (event.code === 'ArrowLeft') {
            turnLeft(player);
        }
        if (event.code === 'ArrowRight') {
            turnRight(player);
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