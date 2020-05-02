var pong2 = `// Pong in Vaporlang
// 2017 Will Smith (minkcv)

var previousGPUState;
var GPUState;
var ballX;
var ballY;
var ballMoveRight;
var ballMoveUp;
var spriteIndex;
var leftPaddleY;
var rightPaddleY;
var buttons;
var moveSpeed;
moveSpeed = 2;
var paddleHeight;
paddleHeight = 64;
var paddleWidth;
paddleWidth = 8;

// set background to light blue
[ 127 , 16 ] = 75;

call initSprites;
call enableGPU;
call reset;

// Main loop
while 1 {
    buttons = [ 127 , 0 ];
    buttons = buttons & 1; // Up button
    if buttons == 1 {
        // If not at the top
        if rightPaddleY > 0 {
            rightPaddleY = rightPaddleY - moveSpeed;
        }
    }
    buttons = [ 127 , 0 ];
    buttons = buttons & 2; // Down button
    if buttons == 2 {
        // If not at the bottom (rightPaddleY + paddleHeight)
        if rightPaddleY < 128 {
            rightPaddleY = rightPaddleY + moveSpeed;
        }
    }
    buttons = [ 127 , 1 ];
    buttons = buttons & 1; // Up button
    if buttons == 1 {
        // If not at the top
        if leftPaddleY > 0 {
            leftPaddleY = leftPaddleY - moveSpeed;
        }
    }
    buttons = [ 127 , 1 ];
    buttons = buttons & 2; // Down button
    if buttons == 2 {
        // If not at the bottom (leftPaddleY + paddleHeight)
        if leftPaddleY < 128 {
            leftPaddleY = leftPaddleY + moveSpeed;
        }
    }
    if ballMoveRight {
        if ballX > 244 {
            // Ball is past right paddle, reset
            call reset;
        }
        if ballX > 232 {
            if ballY > rightPaddleY {
                if ballY < rightPaddleY + paddleHeight {
                    // Ball colliding with right paddle
                    ballMoveRight = 0;
                }
            }
        }
    }
    if ballMoveRight {
        ballX = ballX + moveSpeed;
    }
    if ballMoveRight == 0 {
        if ballX < 4 {
            // Ball ist past left paddle, reset
            call reset;
        }
        if ballX < 20 {
            if ballY > leftPaddleY {
                if ballY < leftPaddleY + paddleHeight {
                    // Ball colliding with left paddle
                    ballMoveRight = 1;
                }
            }
        }
    }
    if ballMoveRight == 0 {
        ballX = ballX - moveSpeed;
    }
    if ballMoveUp {
        if ballY > 0 {
            ballY = ballY - moveSpeed;
        }
    }
    if ballMoveUp == 0 {
        if ballY < 184 {
            ballY = ballY + moveSpeed;
        }
    }
    if ballY == 0 {
        ballMoveUp = 0;
    }
    if ballY == 184 {
        ballMoveUp = 1;
    }
    call render;
    call waitScreen;
}

func render {
    [ 64 , 2 ] = leftPaddleY;
    [ 64 , 18 ] = rightPaddleY;
    [ 64 , 33 ] = ballX;
    [ 64 , 34 ] = ballY;
}

func reset {
    leftPaddleY = 64;
    rightPaddleY = 64;
    ballX = 124;
    ballY = 92;
}

func initSprites {
    // Init left and right paddle sprites
    spriteIndex = 0;
    while spriteIndex < 17 {
        [ 64 , spriteIndex ] = 128; // Enable
        if spriteIndex == 0 {
            [ 64 , spriteIndex + 1 ] = 8; // x position
        }
        if spriteIndex == 16 {
            [ 64 , spriteIndex + 1 ] = 240; // x position
        }
        [ 64 , spriteIndex + 2 ] = 64; // y position
        [ 64 , spriteIndex + 3 ] = paddleWidth;
        [ 64 , spriteIndex + 4 ] = paddleHeight;
        [ 64 , spriteIndex + 5 ] = 128; // Sprite data segment
        [ 64 , spriteIndex + 7 ] = 255; // White
        spriteIndex = spriteIndex + 16;
    }
    // Init ball sprite
    [ 64 , 32 ] = 128; // Enable
    [ 64 , 33 ] = 124; // x position
    [ 64 , 34 ] = 92; // y position
    [ 64 , 35 ] = 8; // Width
    [ 64 , 36 ] = 8; // Height
    [ 64 , 37 ] = 128; // Sprite data segment
    [ 64 , 39 ] = 255; // White
}

func waitScreen {
    while GPUState == previousGPUState {
        GPUState = [ 127 , 17 ];
        GPUState = GPUState & 2;
    }
    previousGPUState = GPUState;
}

func enableGPU {
    [ 127 , 17 ] = 1;
}

`