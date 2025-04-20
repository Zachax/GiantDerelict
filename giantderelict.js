document.addEventListener('DOMContentLoaded', () => {

    // ─────────────────────────────────────────────────────
    // CONSTANTS AND CONFIGURATION
    // ─────────────────────────────────────────────────────

    const screenWidth = 1200; // The whole screen of game graphics
    const screenHeight = 700;
    const visionWidth = screenWidth / 2; // 3D player view window
    const visionHeight = screenHeight * 0.75;
    const cellSize = visionHeight / 10; // Define the size of each cell on the map
    
    // Standard colors
    const COLOR_RED = 0xff0000;
    const COLOR_PURPLE = 0xff00ff;
    const COLOR_BLUE = 0x0a0afa;
    const COLOR_WHITE = 0xffffff;
    const COLOR_CYAN = 0x1099bb;
    const COLOR_BLACK = 0x000000;
    const COLOR_GREY = 0x808080;
    const COLOR_DARKGREY = 0x404040;
    const COLOR_LIGHTGREY = 0xD3D3D3;

    // ─────────────────────────────────────────────────────
    // APPLICATION SETUP
    // ─────────────────────────────────────────────────────

    const app = new PIXI.Application({ width: screenWidth, height: screenHeight, backgroundColor: COLOR_LIGHTGREY });
    document.getElementById('pixi-container').appendChild(app.view);

    // ─────────────────────────────────────────────────────
    // ENUMS AND INITIAL STATE
    // ─────────────────────────────────────────────────────

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

    // ─────────────────────────────────────────────────────
    // TEXT DISPLAY
    // ─────────────────────────────────────────────────────

    // Create a text object for coordinates
    const style = new PIXI.TextStyle({
        fontSize: 24,
        fill: COLOR_BLACK,
        fontFamily: "Arial"
    });
    const coordinatesText = new PIXI.Text("Player Coordinates: (0, 0)", style);
    coordinatesText.x = screenWidth * 0.65;  // Position on the canvas
    coordinatesText.y = visionHeight + 10;
    app.stage.addChild(coordinatesText);

    // Update the text to display player coordinates
    function updateCoordinatesOnScreen(x, y) {
        coordinatesText.text = `Player Coordinates: (${x}, ${y})`;
    }    

    // ─────────────────────────────────────────────────────
    // LEVEL DATA AND BLOCK TYPES
    // ─────────────────────────────────────────────────────

    // Level blocks
    const BLOCK_FILLER = '0';
    const BLOCK_OPEN = 'X';
    const BLOCK_EXIT = '#';
    const BLOCK_START = 'S';

    // Returns true if the coordinate location is open already.
    // checkAllTypes true will report true to all player movable squares
    const isItFree = (level, x, y, checkAllTypes = false, checkType = BLOCK_OPEN) => {
        if ((x >= 0 && x < level.length) && (y >= 0 && y < level[0].length)) {
            let content = level[x][y];
            if (checkAllTypes) {
                return (content === BLOCK_OPEN || content === BLOCK_EXIT || content === BLOCK_START) ? true : false;
            } else {
                return (content === checkType) ? true : false;
            }
        } else {
            return false;
        }
    }

    // Returns coordinates for the first instance of desired block type
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

    // ─────────────────────────────────────────────────────
    // LEVEL GENERATION
    // ─────────────────────────────────────────────────────

    const levelXsize = 10;
    const levelYsize = 10;

    const generateLevel = () => {
        let level = Array.from({ length: levelXsize }, () => new Array(levelYsize).fill(BLOCK_FILLER));
        let startX = Math.floor(Math.random() * (levelXsize - 3) + 2); // Start location must not be at either Y wall
        let startY = 0;
        let x = startX;
        let y = startY;
        let overloadMax = 100; // fail-safe value
        let count = 0;

        let attemptedBits;
        // Silly algorithm to generate a random level "worm"
        while (x > 0 && x < levelXsize-1 && y < levelYsize - 1 && count < overloadMax) {
            let direction = Math.floor(Math.random() * (4));
            let failBit;
            switch (direction) {
                case 0: // Up
                    if (y+1 == levelYsize-1 || !isItFree(level, x, y+1)) {
                        y++;
                    } else {
                        failBit = 0b0001;
                    }
                    break;
                case 1: // Right
                    if (x+1 == levelXsize-1 || !isItFree(level, x+1, y)) {
                        x++;
                    } else {
                        failBit = 0b0010;
                    }
                    break;
                case 2: // Down
                    if (y-1 > 1 && !isItFree(level, x, y-1)) {
                        y--;
                    } else {
                        failBit = 0b0100;
                    }
                    break;
                case 3: // Left
                    if (x-1 == 0 || !isItFree(level, x-1, y)) {
                        x--;
                    } else {
                        failBit = 0b1000;
                    }
                    break;
                default:
            }
            if (x > 0 && x < levelXsize-1 && y < levelYsize-1) {
                if (isItFree(level, x, y)) {
                } else {
                    level[x][y] = BLOCK_OPEN;                    
                    attemptedBits = 0b0000;
                }
            } else {
                level[x][y] = BLOCK_EXIT;
                attemptedBits = 0b0000;
            }

            attemptedBits = attemptedBits | failBit;
            if (attemptedBits === 0b1111) {
                y = levelYsize-1;
            }

            count++;
            if (count >= overloadMax) {
            }
        }

        level[startX][startY] = BLOCK_START;
        return level;
    }

    let level = generateLevel();

    // ─────────────────────────────────────────────────────
    // LEVEL DEBUG / HARDCODED DEMO (Optional)
    // ─────────────────────────────────────────────────────

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

    // ─────────────────────────────────────────────────────
    // RENDERING: MAP DISPLAY
    // ─────────────────────────────────────────────────────

    let levelContainer = new PIXI.Container();
    app.stage.addChild(levelContainer);

    for (let row = 0; row < level.length; row++) {
        for (let col = 0; col < level[row].length; col++) {
            let cell = new PIXI.Graphics();

            let color;
            if (level[row][col] === BLOCK_OPEN) {
                color = COLOR_RED;
            } else if (level[row][col] === BLOCK_EXIT) {
                color = COLOR_PURPLE;
            } else if (level[row][col] === BLOCK_START) {
                color = COLOR_BLUE;
            } else {
                color = COLOR_WHITE;
            }

            cell.beginFill(color);
            cell.drawRect(row * cellSize, col * cellSize, cellSize, cellSize);
            cell.endFill();
            levelContainer.addChild(cell);
        }
    }

    // Map location on the UI
    let bounds = levelContainer.getLocalBounds();
    levelContainer.x = screenWidth - bounds.width;
    levelContainer.y = 0;
    
    // ─────────────────────────────────────────────────────
    // RENDERING: PLAYER VISION
    // ─────────────────────────────────────────────────────
    
    const maxVisionRange = 7; // Distance of checking wall visibility

    // The actual vision as a container
    let visionContainer = new PIXI.Container();
    app.stage.addChild(visionContainer);

    // Vision canvas
    const visionWindow = new PIXI.Graphics();
    visionContainer.addChild(visionWindow);

    // Background
    const drawVisionBackground = () => {
        visionWindow.clear(); // Clear previous frame
        visionWindow.beginFill(COLOR_DARKGREY);
        visionWindow.drawRect(0, 0, visionWidth, visionHeight); // 3D view window area
        visionWindow.endFill();
    }

    let frontWall = null; // Store the front wall for easy updates

    const drawWallFront = (distance = 0) => {
        // Only redraw the front wall if it changes
        let wallWidth = (visionWidth / 10) * visionHeight * 0.01 / distance;
        let wallHeight = (visionHeight / 7) * visionHeight * 0.01 / distance;

        // If the front wall already exists, update it
        if (frontWall) {
            frontWall.clear();
            frontWall.beginFill(COLOR_GREY);
            frontWall.drawRect(
                (visionWidth / 2 - wallWidth / 2),
                (visionHeight / 2 - wallHeight / 2),
                wallWidth,
                wallHeight
            );
            frontWall.endFill();
        } else {
            // If the front wall doesn't exist, create it and add to visionWindow
            frontWall = new PIXI.Graphics();
            frontWall.beginFill(COLOR_GREY);
            frontWall.drawRect(
                (visionWidth / 2 - wallWidth / 2),
                (visionHeight / 2 - wallHeight / 2),
                wallWidth,
                wallHeight
            );
            frontWall.endFill();
            visionWindow.addChild(frontWall);
        }
    }

    const getWallQuad = (distance, side) => {
        // side: -1 = left, 1 = right

        // Adjust depth scaling so that it stays within reasonable bounds
        const depth1 = (distance) / maxVisionRange;  // Scale from 0 to 1
        const depth2 = (distance + 1) / maxVisionRange;  // Scale from 0 to 1

        // The center of the vision window (static)
        const centerY = visionHeight;
        const centerX = visionWidth / 2;

        // Use depth to adjust vertical (y) and horizontal (x) positions
        // Start at the edge, move inward
        const y1 = centerY - (visionHeight / 2) * depth2;  // Start at the edge, move inward
        const y2 = centerY - (visionHeight / 2) * depth1;  // Start at the edge, move inward
        
        const y3 = centerY + (visionHeight / 2) * depth1;  // Start at the edge, move inward
        const y4 = centerY + (visionHeight / 2) * depth2;  // Start at the edge, move inward

        // Apply depth scaling to horizontal position
        const x1 = centerX + side * (visionWidth / 2) * (1 - depth1);  // Start at the edge, move inward
        const x2 = centerX + side * (visionWidth / 2) * (1 - depth2);  // Start at the edge, move inward
        
        // debug
        console.log("x1:", x1, "y1:", y1, "\nx2:", x2, "y2:", y2);

        // Return the four points for the side wall quadrilateral
        return [
            { x: x1, y: y1 }, // top-left
            { x: x2, y: y2 }, // top-right
            { x: x2, y: y3 }, // bottom-right
            { x: x1, y: y4 }  // bottom-left
        ];
    };

    const drawWallSide = (distance, side) => {
        const quad = getWallQuad(distance, side);

        // Create a new PIXI graphics object for the side wall
        const wall = new PIXI.Graphics();
        wall.beginFill(COLOR_BLUE); // Color for the wall

        // Start drawing the wall by moving to the first point
        wall.moveTo(quad[0].x, quad[0].y);

        // Draw the top line (from near outer to far outer)
        wall.lineTo(quad[1].x, quad[1].y);
        // Draw the far side (from far outer to far inner)
        wall.lineTo(quad[2].x, quad[2].y);
        // Draw the bottom line (from far inner to near inner)
        wall.lineTo(quad[3].x, quad[3].y);
        // Close the quadrilateral by connecting back to the first point
        wall.lineTo(quad[0].x, quad[0].y);

        // Finalize the fill to make it a solid shape
        wall.endFill();

        // Add the wall graphics to the vision window
        visionWindow.addChild(wall);
    };

    const getDirectionModifiers = (piece) => {
        switch (piece.heading) {
            case Direction.Up: return [0,-1];
            case Direction.Down: return [0,1];
            case Direction.Left: return [-1,0];
            case Direction.Right: return [1,0];
        }
    };

    const renderPlayerVision = () => {
        drawVisionBackground(); // Clear and redraw the background

        let directionModifiers = getDirectionModifiers(player);
        let xMod = directionModifiers[0];
        let yMod = directionModifiers[1];
        
        let currentlyVisible = maxVisionRange;
        
        let frontWallDrawn = false; // Track if front wall has been drawn

        // Check front wall visibility
        for (let i = 0; i < maxVisionRange; i++) {
            if (!isItFree(level, player.x + xMod * i, player.y + yMod * i, true)) {
                drawWallFront(i); // Draw front wall only when an obstacle is hit
                currentlyVisible = i;
                frontWallDrawn = true;
                break;
            }
        }
        
        // Clear front wall if not drawn
        if (!frontWallDrawn && frontWall) {
            frontWall.clear(); // Clear the front wall if no obstacle is found
        }

        // Side drawing not yet functional

        // Check left side visibility
        for (let i = 0; i < currentlyVisible; i++) {
            //drawWallSide(i, -1); // Draw left wall
            if (!isItFree(level, player.x + xMod * i, player.y + yMod * i, true)) {
                //drawWallSide(i, -1); // Draw left wall
                break;
            }
        }

        // Check right side visibility
        for (let i = 0; i < currentlyVisible; i++) {
            if (!isItFree(level, player.x + xMod * i, player.y + yMod * i, true)) {
                //drawWallSide(i, 1); // Draw right wall
                break;
            }
        }
    }

    
    // ─────────────────────────────────────────────────────
    // CONTROL BUTTONS
    // ─────────────────────────────────────────────────────
    
    const buttonSize = 50;
    const centerX = app.screen.width / 2;
    const centerY = visionHeight + buttonSize * 1.5;

    const offsets = {
        [Direction.Up]:    { x: 0, y: -buttonSize },
        [Direction.Down]:  { x: 0, y: buttonSize },
        [Direction.Left]:  { x: -buttonSize, y: 0 },
        [Direction.Right]: { x: buttonSize, y: 0 }
    };

    function drawArrowButton(x, y, direction) {
        const g = new PIXI.Graphics();
        g.beginFill(0x00aaff);
        g.lineStyle(2, 0xffffff);

        switch (direction) {
            case Direction.Up:
                g.moveTo(x, y - 20);
                g.lineTo(x - 15, y + 10);
                g.lineTo(x + 15, y + 10);
                break;
            case Direction.Down:
                g.moveTo(x, y + 20);
                g.lineTo(x - 15, y - 10);
                g.lineTo(x + 15, y - 10);
                break;
            case Direction.Left:
                g.moveTo(x - 20, y);
                g.lineTo(x + 10, y - 15);
                g.lineTo(x + 10, y + 15);
                break;
            case Direction.Right:
                g.moveTo(x + 20, y);
                g.lineTo(x - 10, y - 15);
                g.lineTo(x - 10, y + 15);
                break;
        }

        g.closePath();
        g.endFill();

        g.interactive = true;
        g.buttonMode = true;

        g.on('pointerdown', () => {
            masterMoveDirection(player, direction);
            g.tint = 0xffff00;
            setTimeout(() => g.tint = 0xffffff, 100);
        });

        app.stage.addChild(g);
    }

    // Create all four buttons
    Object.values(Direction).forEach(dir => {
        const offset = offsets[dir];
        drawArrowButton(centerX + offset.x, centerY + offset.y, dir);
    });

    // ─────────────────────────────────────────────────────
    // PLAYER SETUP
    // ─────────────────────────────────────────────────────

    playerStartCoordinates = findBlock(BLOCK_START, level);
    levelContainer.addChild(player.sprite);

    player.x = playerStartCoordinates[0];
    player.y = playerStartCoordinates[1];

    const rotatePiece = (piece) => {
        switch (piece.heading) {
            case Direction.Up: piece.sprite.rotation = 3 * Math.PI / 2; break;
            case Direction.Down: piece.sprite.rotation = Math.PI / 2; break;
            case Direction.Left: piece.sprite.rotation = Math.PI; break;
            case Direction.Right: piece.sprite.rotation = 0; break;
        }
    };

    renderPlayerVision(); // Init screen

    // ─────────────────────────────────────────────────────
    // PLAYER MOVEMENT AND ROTATION
    // ─────────────────────────────────────────────────────

    const moveForward = (piece) => {
        let newAxisObjective;
        switch (piece.heading) {
            case Direction.Up: newAxisObjective = piece.y - 1; if (isItFree(level, piece.x, newAxisObjective, true)) piece.y = newAxisObjective; break;
            case Direction.Down: newAxisObjective = piece.y + 1; if (isItFree(level, piece.x, newAxisObjective, true)) piece.y = newAxisObjective; break;
            case Direction.Left: newAxisObjective = piece.x - 1; if (isItFree(level, newAxisObjective, piece.y, true)) piece.x = newAxisObjective; break;
            case Direction.Right: newAxisObjective = piece.x + 1; if (isItFree(level, newAxisObjective, piece.y, true)) piece.x = newAxisObjective; break;
        }
    };

    const turnBack = (piece) => {
        switch (piece.heading) {
            case Direction.Up: piece.heading = Direction.Down; break;
            case Direction.Down: piece.heading = Direction.Up; break;
            case Direction.Left: piece.heading = Direction.Right; break;
            case Direction.Right: piece.heading = Direction.Left; break;
        }
    };

    const turnLeft = (piece) => {
        switch (piece.heading) {
            case Direction.Up: piece.heading = Direction.Left; break;
            case Direction.Down: piece.heading = Direction.Right; break;
            case Direction.Left: piece.heading = Direction.Down; break;
            case Direction.Right: piece.heading = Direction.Up; break;
        }
    };

    const turnRight = (piece) => {
        switch (piece.heading) {
            case Direction.Up: piece.heading = Direction.Right; break;
            case Direction.Down: piece.heading = Direction.Left; break;
            case Direction.Left: piece.heading = Direction.Up; break;
            case Direction.Right: piece.heading = Direction.Down; break;
        }
    };
    
    // Use this when setting player movement, it also causes a tick in game for refreshing etc., and it's input type agnostic
    const masterMoveDirection = (piece, direction) => {
        switch (direction) {
            case Direction.Up: moveForward(piece); break;
            case Direction.Down: turnBack(piece); break;
            case Direction.Left: turnLeft(piece); break;
            case Direction.Right: turnRight(piece); break;
        }
        renderPlayerVision(); // Refresh screen after key pressing
    }

    // ─────────────────────────────────────────────────────
    // INPUT HANDLING: KEYBOARD
    // ─────────────────────────────────────────────────────

    const keys = {};
    document.addEventListener('keydown', (event) => {
        keys[event.key] = true;
    });

    document.addEventListener('keyup', (event) => {
        keys[event.key] = false;
        if (event.code === 'ArrowUp') masterMoveDirection(player, Direction.Up);
        if (event.code === 'ArrowDown') masterMoveDirection(player, Direction.Down);
        if (event.code === 'ArrowLeft') masterMoveDirection(player, Direction.Left);
        if (event.code === 'ArrowRight') masterMoveDirection(player, Direction.Right);
    });

    // ─────────────────────────────────────────────────────
    // INPUT HANDLING: TOUCH / MOBILE
    // ─────────────────────────────────────────────────────

/*
    const calibrationFactor = 5; // Adjust as needed
    const touchArea = new PIXI.Graphics();
    touchArea.beginFill(COLOR_WHITE, 0.2);
    touchArea.drawRect(0, screenHeight - 100, screenWidth, 100);
    touchArea.endFill();
    app.stage.addChild(touchArea);

    touchArea.interactive = true;
    touchArea.on('touchstart', (event) => {
        let touch = event.data.getLocalPosition(touchArea);
        let xPos = touch.x;
        let yPos = touch.y;
        let angle = Math.atan2(yPos - visionHeight, xPos - screenWidth / 2);
        let delta = Math.abs(angle);

        if (delta < Math.PI / 4) {
            moveForward(player);
        }
    });
    */
    
    
    // ─────────────────────────────────────────────────────
    // MAIN UPDATE LOOP
    // ─────────────────────────────────────────────────────
    app.ticker.add(() => {
        rotatePiece(player);
        updateCoordinatesOnScreen(player.x, player.y);
        player.sprite.x = cellSize / 2 + player.x * cellSize;
        player.sprite.y = cellSize / 2 + player.y * cellSize;
    });
});