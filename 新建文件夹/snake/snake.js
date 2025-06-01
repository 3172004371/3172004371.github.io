const gameArea = document.getElementById('gameArea');
const scoreElement = document.getElementById('score');
const startBtn = document.getElementById('start');
const restartBtn = document.getElementById('restart');
const pauseBtn = document.getElementById('pause');
const difficultySelect = document.getElementById('difficulty');
const gameContent = document.getElementById('gameContent');
const eatSound = document.getElementById('eatSound');
const gameOverSound = document.getElementById('gameOverSound');

let snake = [];
let food = {};
let direction = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 };
let gameRunning = false;
let gamePaused = false;
let gameInterval;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let speed = 100;

// 初始化游戏
function initGame() {
    snake = [
        { x: 200, y: 200 },
        { x: 180, y: 200 },
        { x: 160, y: 200 }
    ];
    
    direction = { x: 20, y: 0 };
    nextDirection = { x: 20, y: 0 };
    score = 0;
    scoreElement.textContent = score;
    generateFood();
    drawGame();
}

// 绘制游戏
function drawGame() {
    gameArea.innerHTML = '';
    
    // 绘制蛇
    snake.forEach((segment, index) => {
        const snakeElement = document.createElement('div');
        snakeElement.classList.add('snake');
        if (index === 0) {
            snakeElement.classList.add('snake-head');
        }
        snakeElement.style.left = `${segment.x}px`;
        snakeElement.style.top = `${segment.y}px`;
        gameArea.appendChild(snakeElement);
    });
    
    // 绘制食物
    const foodElement = document.createElement('div');
    foodElement.classList.add('food');
    foodElement.style.left = `${food.x}px`;
    foodElement.style.top = `${food.y}px`;
    gameArea.appendChild(foodElement);
}

// 生成食物
function generateFood() {
    const maxX = Math.floor(gameArea.clientWidth / 20) - 1;
    const maxY = Math.floor(gameArea.clientHeight / 20) - 1;
    
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * maxX) * 20,
            y: Math.floor(Math.random() * maxY) * 20
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    food = newFood;
}

// 移动蛇
function moveSnake() {
    if (!gameRunning || gamePaused) return;
    
    // 更新方向
    direction = { ...nextDirection };
    
    const head = { 
        x: snake[0].x + direction.x, 
        y: snake[0].y + direction.y 
    };
    
    // 检查碰撞
    if (
        head.x < 0 || 
        head.x >= gameArea.clientWidth || 
        head.y < 0 || 
        head.y >= gameArea.clientHeight
    ) {
        gameOver("撞墙死亡!");
        return;
    }
    
    // 检查是否撞到自己
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver("撞到自己!");
        return;
    }
    
    // 添加新头部
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        eatSound.currentTime = 0;
        eatSound.play();
        generateFood();
    } else {
        // 移除尾部
        snake.pop();
    }
    
    drawGame();
}

// 游戏结束
function gameOver(reason) {
    gameRunning = false;
    clearInterval(gameInterval);
    gameOverSound.play();
    
    // 更新最高分
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
    }
    
    // 显示游戏结束信息
    const gameOverDiv = document.createElement('div');
    gameOverDiv.classList.add('game-over');
    gameOverDiv.innerHTML = `
        <h2>游戏结束!</h2>
        <p>${reason}</p>
        <p>你的分数: ${score}</p>
        <p>最高分: ${highScore}</p>
    `;
    gameArea.appendChild(gameOverDiv);
    
    // 显示重新开始按钮
    restartBtn.style.display = 'inline-block';
    pauseBtn.style.display = 'none';
}

// 开始游戏
function startGame() {
    // 隐藏开始按钮，显示游戏内容
    startBtn.style.display = 'none';
    gameContent.style.display = 'block';
    restartBtn.style.display = 'none';
    pauseBtn.style.display = 'inline-block';
    
    // 移除之前的游戏结束提示
    const gameOverDiv = document.querySelector('.game-over');
    if (gameOverDiv) {
        gameOverDiv.remove();
    }
    
    speed = parseInt(difficultySelect.value);
    initGame();
    gameRunning = true;
    gamePaused = false;
    pauseBtn.textContent = '暂停';
    gameInterval = setInterval(moveSnake, speed);
}

// 暂停/继续游戏
function togglePause() {
    if (!gameRunning) return;
    
    gamePaused = !gamePaused;
    pauseBtn.textContent = gamePaused ? '继续' : '暂停';
}

// 键盘控制
document.addEventListener('keydown', (e) => {
    // 空格键暂停/继续
    if (e.key === ' ') {
        togglePause();
        return;
    }
    
    // 方向键控制
    switch (e.key) {
        case 'ArrowUp':
            if (direction.y === 0) nextDirection = { x: 0, y: -20 };
            break;
        case 'ArrowDown':
            if (direction.y === 0) nextDirection = { x: 0, y: 20 };
            break;
        case 'ArrowLeft':
            if (direction.x === 0) nextDirection = { x: -20, y: 0 };
            break;
        case 'ArrowRight':
            if (direction.x === 0) nextDirection = { x: 20, y: 0 };
            break;
    }
});

// 按钮事件监听
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);