const container = document.getElementById('game-container');
const player = document.getElementById('player');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const scoreBoard = document.getElementById('score-board');
const scoreEl = document.getElementById('score');
const finalScoreEl = document.getElementById('final-score');

// Fallback: ensure buttons trigger actions even if inline handlers fail
const playBtn = document.querySelector('#start-screen button');
const tryAgainBtn = document.querySelector('#game-over-screen button:not(.secondary)');
const exitBtn = document.querySelector('#game-over-screen .secondary');

if (playBtn) playBtn.addEventListener('click', () => window.startGame?.());
if (tryAgainBtn) tryAgainBtn.addEventListener('click', () => window.startGame?.());
if (exitBtn) exitBtn.addEventListener('click', () => window.exitToMenu?.());

let gameRunning = false;
let moveDirection = 0;
let leftPressed = false;
let rightPressed = false;
let playerX = 0;
let lastTime = 0;
let scoreTime = 0;
let obstacleSpeed = 140; // px/s
let playerSpeed = 320; // px/s
let spawnIntervalId = null;
let obstacles = [];

function clamp(val, min, max) {
	return Math.min(Math.max(val, min), max);
}

function resetPlayerPosition() {
	const cw = container.clientWidth;
	const pw = player.offsetWidth;
	playerX = (cw - pw) / 2;
	player.style.left = playerX + 'px';
}

function spawnObstacle() {
	if (!gameRunning) return;
	const el = document.createElement('div');
	el.className = 'obstacle';
	el.textContent = '👾';
	el.style.top = '-40px';
	container.appendChild(el);
	const cw = container.clientWidth;
	const ow = el.offsetWidth || 40;
	const x = Math.floor(Math.random() * (cw - ow));
	el.style.left = x + 'px';
	obstacles.push({ el, y: -40 });
}

function updatePositions(dt) {
	playerX += moveDirection * playerSpeed * dt;
	const maxX = container.clientWidth - player.offsetWidth;
	playerX = clamp(playerX, 0, maxX);
	player.style.left = playerX + 'px';

	for (let i = obstacles.length - 1; i >= 0; i--) {
		const o = obstacles[i];
		o.y += obstacleSpeed * dt;
		o.el.style.top = o.y + 'px';
		if (o.y > container.clientHeight) {
			o.el.remove();
			obstacles.splice(i, 1);
		}
	}
}

function checkCollisions() {
	const pRect = player.getBoundingClientRect();
	for (const o of obstacles) {
		const oRect = o.el.getBoundingClientRect();
		const overlap = !(
			oRect.right < pRect.left ||
			oRect.left > pRect.right ||
			oRect.bottom < pRect.top ||
			oRect.top > pRect.bottom
		);
		if (overlap) {
			gameOver();
			return;
		}
	}
}

function gameLoop(timestamp) {
	if (!gameRunning) return;
	if (!lastTime) lastTime = timestamp;
	const dt = (timestamp - lastTime) / 1000;
	lastTime = timestamp;

	updatePositions(dt);
	checkCollisions();

	scoreTime += dt;
	const displayed = Math.floor(scoreTime * 10);
	scoreEl.textContent = String(displayed);

	requestAnimationFrame(gameLoop);
}

function startGame() {
	if (gameRunning) return;
	gameRunning = true;
	startScreen.classList.add('hidden');
	gameOverScreen.classList.add('hidden');
	scoreTime = 0;
	lastTime = 0;

	obstacles.forEach(o => o.el.remove());
	obstacles = [];
	resetPlayerPosition();

	clearInterval(spawnIntervalId);
	spawnIntervalId = setInterval(spawnObstacle, 800);
	requestAnimationFrame(gameLoop);
}

function gameOver() {
	if (!gameRunning) return;
	gameRunning = false;
	clearInterval(spawnIntervalId);
	const finalDisplayed = Math.floor(scoreTime * 10);
	finalScoreEl.textContent = String(finalDisplayed);
	gameOverScreen.classList.remove('hidden');
}

function exitToMenu() {
	gameRunning = false;
	clearInterval(spawnIntervalId);
	obstacles.forEach(o => o.el.remove());
	obstacles = [];
	scoreEl.textContent = '0';
	startScreen.classList.remove('hidden');
	gameOverScreen.classList.add('hidden');
}

function handleKeyDown(e) {
	if (!gameRunning) return;
	if (e.key === 'ArrowLeft') {
		leftPressed = true;
	} else if (e.key === 'ArrowRight') {
		rightPressed = true;
	}
	moveDirection = rightPressed ? 1 : leftPressed ? -1 : 0;
}

function handleKeyUp(e) {
	if (e.key === 'ArrowLeft') {
		leftPressed = false;
	} else if (e.key === 'ArrowRight') {
		rightPressed = false;
	}
	moveDirection = rightPressed ? 1 : leftPressed ? -1 : 0;
}

function handlePointerDown(e) {
	if (!gameRunning) return;
	const rect = container.getBoundingClientRect();
	const mid = rect.left + rect.width / 2;
	if (e.clientX < mid) {
		leftPressed = true;
		rightPressed = false;
	} else {
		rightPressed = true;
		leftPressed = false;
	}
	moveDirection = rightPressed ? 1 : leftPressed ? -1 : 0;
}

function handlePointerUp() {
	leftPressed = false;
	rightPressed = false;
	moveDirection = 0;
}

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);
container.addEventListener('pointerdown', handlePointerDown);
container.addEventListener('pointerup', handlePointerUp);
container.addEventListener('pointerleave', handlePointerUp);
container.addEventListener('pointercancel', handlePointerUp);

window.startGame = startGame;
window.exitToMenu = exitToMenu;

