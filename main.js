// Инициализация игры
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Установка размеров canvas в пикселях
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

// Стили
const BG_COLOR = '#333333';
const BALL_COLOR = '#aa00c1';
const EASY_COLOR = '#00e83e';
const MEDIUM_COLOR = '#2eb6ff';
const HARD_COLOR = '#db0042';
const BORDER_COLOR = '#cccccc';
const BORDER_SIZE = 1;
const GRID_OFFSET = 10;

// Хардкод, который менять слишком накладно
MAX_ROWS = 12;
MAX_COLUMNS = 9;

// Глобальные переменные
const SHOT_DELAY = 100;
const BALL_RADIUS = 5;
const BALL_SPEED = 2;

// Параметры игры
let currentLevel = 0;
let balls = [];
let bricks = [];
const brickWidth = (canvas.width - 2 * GRID_OFFSET) / MAX_ROWS;
const brickHeight = (canvas.height - 2 * GRID_OFFSET) / MAX_COLUMNS;
let launchPoint = { x: canvas.width / 2, y: canvas.height - 30 };
let angle = 0;
let isMouseDown = false;
let ballsToLaunch = 5;
let isShooting = false;

// Обработка ввода

canvas.addEventListener("mousedown", mouseDownHandler, false);
canvas.addEventListener("mousemove", mouseMoveHandler, false);
canvas.addEventListener("mouseup", mouseUpHandler, false);

function mouseDownHandler(e) {
    if (!isShooting) {
        isMouseDown = true;
    }
}

function mouseMoveHandler(e) {
    if (isMouseDown && !isShooting) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        angle = Math.atan2(mouseY - launchPoint.y, mouseX - launchPoint.x);
    }
}

function mouseUpHandler(e) {
    if (!isShooting) {
        isMouseDown = false;
        launchBalls();
    }
}

// Конец обработки ввода




function launchBalls() {
    isShooting = true;
    let ballIndex = 0;
    const interval = setInterval(() => {
        if (ballIndex < ballsToLaunch) {
            balls.push({
                x: launchPoint.x,
                y: launchPoint.y,
                dx: ballSpeed * Math.cos(angle),
                dy: ballSpeed * Math.sin(angle)
            });
            ballIndex++;
        } else {
            clearInterval(interval);
        }
    }, SHOT_DELAY);
}

// Обработка столкновений
function collisionDetection() {
    for (let i = 0; i < balls.length; i++) {
        const ball = balls[i];
        for (let c = 0; c < MAX_COLUMNS; c++) {
            for (let r = 0; r < MAX_ROWS; r++) {
                const brick = bricks[c][r];
                if (brick.status === 1) {
                    if (ball.x > brick.x && ball.x < brick.x + brickWidth && ball.y > brick.y && ball.y < brick.y + brickHeight) {
                        ball.dy = -ball.dy;
                        brick.strength--;
                        if (brick.strength <= 0) {
                            brick.status = 0;
                        }
                    }
                }
            }
        }
    }
}

// Отрисовка объектов

function drawBall(ball) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = BALL_COLOR;
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < MAX_COLUMNS; c++) {
        for (let r = 0; r < MAX_ROWS; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (brickWidth + BORDER_SIZE) + GRID_OFFSET;
                const brickY = r * (brickHeight + BORDER_SIZE) + GRID_OFFSET;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.lineWidth = brickBorderWidth;
                ctx.strokeStyle = "#000000";
                ctx.stroke();
                ctx.closePath();
                // Отображение прочности
                ctx.fillStyle = "#FFFFFF";
                ctx.font = "16px Arial";
                ctx.fillText(bricks[c][r].strength, brickX + brickWidth / 2 - 5, brickY + brickHeight / 2 + 5);
            }
        }
    }
}

function drawLaunchPoint() {
    ctx.beginPath();
    ctx.arc(launchPoint.x, launchPoint.y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#FF0000";
    ctx.fill();
    ctx.closePath();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawLaunchPoint();
    for (let i = 0; i < balls.length; i++) {
        drawBall(balls[i]);
    }
    collisionDetection();

    for (let i = 0; i < balls.length; i++) {
        const ball = balls[i];
        if (ball.x + ball.dx > canvas.width - ballRadius || ball.x + ball.dx < ballRadius) {
            ball.dx = -ball.dx;
        }
        if (ball.y + ball.dy < ballRadius) {
            ball.dy = -ball.dy;
        } else if (ball.y + ball.dy > canvas.height - ballRadius) {
            balls.splice(i, 1); // Уничтожаем мяч, упавший на пол
            i--;
        } else {
            ball.x += ball.dx;
            ball.y += ball.dy;
        }
    }

    if (balls.length === 0) {
        isShooting = false; // Завершаем выстрел, когда все мячи падают на пол
        moveBricksDown();
        fillTopRow();
    }

    if (!checkGameOver())
        requestAnimationFrame(draw);
}

// Конец отрисовки объектов


// Функции для работы с уровнями

function newLevel() {
    currentLevel++;

    const level = levels[currentLevel - 1];

    const initialRowsCount = level.getInitialRowsCount();
    
    for (let i = 0; i < initialRowsCount; i++) {
        dropNextLine();
    }
}

function dropNextLine() {
    for (let i = 0; i < bricks.length; i++) {
        bricks[i].y++;
        if (bricks[i].y === MAX_ROWS - 1) {
            console.log("Game over!");
            return;
        }
    }

    const level = levels[currentLevel - 1];

    if (level.rows.length === 0) {
        console.log("Level complete!");
        return;
    }

    const row = level.nextRow();
    for (let i = 0; i < row.length; i++) {
        const brick = row[i];
        bricks[i].unshift(brick);
    }
}

// Конец функций для работы с уровнями

// Запуск игрового цикла
newLevel();
draw();