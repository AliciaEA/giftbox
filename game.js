
// var
const gameContainer = document.getElementById('game-container')
const player = document.getElementById('player')
const scoreDisplay = getElementById('score')
const finalScoreDisplay = document.getElementById('final-score')
const startScreen = document.getElementById('start-screen')
const gameOverScreen = document.getElementById('game-over-screen')

let isPlaying = false
let score = 0
let obstacleSpeed = 5
let obstacleInterval
let gameLoopId
let obstacles = [];

let playerPositionPercent = 50
let playerMoveSpeed = 1.8
let isMovingLeft = false
let isMovingRight = false

// mobile responsive

gameContainer.addEventListener('touchstart', handleTouch, { passive: false });
gameContainer.addEventListener('touchend', stopTouch, { passive: false });
gameContainer.addEventListener('touchcancel', stopTouch, { passive: false });

function handleTouch(e) {
    if (!isPlaying) return;
    e.preventDefault();

    const screenWidth = window.innerWidth;
    const touchX = e.touches[0].clientX;

    if (touchX < screenWidth / 2) {
        isMovingLeft = true;
        isMovingRight = false;
    } else {
        isMovingLeft = false;
        isMovingRight = true;
    }
}

function stopTouch(e) {
    if (e.touches.length === 0) {
        isMovingLeft = false;
        isMovingRight = false;
    }
    document.addEventListener('keydown', (e) => {
        if (!isPlaying) return;
        if (e.key === 'ArrowLeft') { isMovingLeft = true; }
        if (e.key === 'ArrowRight') { isMovingRight = true; }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft') { isMovingLeft = false; }
        if (e.key === 'ArrowRight') { isMovingRight = false; }
    });
}


// Main Logic

function startGame() {
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    isPlaying = true;
    score = 0;
    obstacleSpeed = 5;
    scoreDisplay.innerText = score;

    playerPositionPercent = 50;
    updatePlayerPosition();
    isMovingLeft = false;
    isMovingRight = false;

    obstacles.forEach(obs => obs.element.remove());
    obstacles = [];

    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    gameLoopId = requestAnimationFrame(gameLoop);

    clearInterval(obstacleInterval);
    obstacleInterval = setInterval(spawnObstacle, 1000);
}

function exitToMenu() {
    gameOverScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    isPlaying = false;

    obstacles.forEach(obs => obs.element.remove())
    obstacles = [];
    resetGameVariables();
}
function resetGameVariables() {
    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    clearInterval(obstacleInterval);
    isMovingLeft = false; isMovingRight = false;
    playerPositionPercent = 50;
    updatePlayerPosition();
}

function spawnObstacle() {
    if (!isPlaying) return;
    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    obstacle.innerText = '👾';
    const randomX = Math.floor(Math.random() * 85) + 5;
    obstacle.style.left = randomX + '%';
    obstacle.style.top = '-50px';
    gameContainer.appendChild(obstacle);
    obstacles.push({ element: obstacle, y: -50 });

    if (score > 0 && score % 5 === 0) {
        obstacleSpeed += 0.3;
        clearInterval(obstacleInterval);
        let newTime = Math.max(500, 1000 - (score * 20));
        obstacleInterval = setInterval(spawnObstacle, newTime);
    }
}

function updatePlayerPosition() {
    if (playerPositionPercent < 6) playerPositionPercent = 6;
    if (playerPositionPercent > 94) playerPositionPercent = 94;
    player.style.left = playerPositionPercent + '%';
}

function gameLoop() {
    if (isMovingLeft) {
        playerPositionPercent -= playerMoveSpeed;
    }
    if (isMovingRight) {
        playerPositionPercent += playerMoveSpeed;
    }
    updatePlayerPosition();

    obstacles.forEach((obs, index) => {
        obs.y += obstacleSpeed;
        obs.element.style.top = obs.y + 'px';

        const playerRect = player.getBoundingClientRect();
        const obsRect = obs.element.getBoundingClientRect();

        const hitboxPaddingX = 20;
        const hitboxPaddingY = 15;

        if (
            playerRect.top + hitboxPaddingY < obsRect.bottom &&
            playerRect.bottom - hitboxPaddingY > obsRect.top &&
            playerRect.left + hitboxPaddingX < obsRect.right &&
            playerRect.right - hitboxPaddingX > obsRect.left
        ) {
            gameOver();
        }

        if(obs.y > gameContainer.offsetHeight){
            obs.element.remove();
            obstacleSpeed.splice(index, 1);
            score++;
            scoreDisplay.innerText =score;
        }
    });

    gameLoopId = requestAnimationFrame(gameLoop);
}

function gameOver(){
    isPlaying=false;
    resetGameVariables();
    finalScoreDisplay.innerText = score;
    gameOverScreen.classList.remove('hidden');
}

updatePlayerPosition()