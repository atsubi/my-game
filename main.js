import { Ball } from './ball.js';
import { Sparkle } from './sparkle.js';

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

const balls = [];
const effects = [];
let removedBallCount = 0;
let gameState = 'before_start'; // 'before_start', 'playing', 'game_over'
const GAME_DURATION = 30000; // 30秒
let startTime;

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  switch (gameState) {
    case 'before_start': {
      const button = {
        x: canvas.width / 2 - 125,
        y: canvas.height / 2 - 30,
        width: 250,
        height: 60
      };
      if (x > button.x && x < button.x + button.width && y > button.y && y < button.y + button.height) {
        startGame();
      }
      break;
    }
    case 'game_over': {
      const button = {
        x: canvas.width / 2 - 125,
        y: canvas.height / 2 + 100,
        width: 250,
        height: 60
      };
      if (x > button.x && x < button.x + button.width && y > button.y && y < button.y + button.height) {
        startGame();
      }
      break;
    }
    case 'playing': {
      for (let i = balls.length - 1; i >= 0; i--) {
        if (balls[i].contains(x, y)) {
          balls.splice(i, 1);
          removedBallCount++;
          effects.push(new Sparkle(x, y));
          return;
        }
      }
      break;
    }
  }
});

const MAX_BALLS = 15;

function autoGenerateBall() {
  if (gameState !== 'playing') return;

  if (balls.length < MAX_BALLS) {
    const radius = canvas.width * 0.05;
    const x = Math.random() * (canvas.width - radius * 2) + radius;
    const y = Math.random() * (canvas.height - radius * 2) + radius;

    const newBall = new Ball(x, y, canvas);

    // 他のボールと重なっていないかチェック
    const isOverlapping = balls.some(ball => newBall.intersects(ball));

    if (!isOverlapping) {
      effects.push(new Sparkle(x, y));
      balls.push(newBall);
    }
  }

  // 1〜3秒後に次の自動生成を予約
  const delay = Math.random() * 500 + 500; // 0.5秒から1秒間隔
  setTimeout(autoGenerateBall, delay);
}

function handleCollisions() {
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const b1 = balls[i];
      const b2 = balls[j];
      const dx = b2.x - b1.x;
      const dy = b2.y - b1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < b1.radius + b2.radius) {
        const nx = dx / dist;
        const ny = dy / dist;

        // 位置補正（重なり解消）
        const overlap = (b1.radius + b2.radius - dist) / 2;
        b1.x -= overlap * nx;
        b1.y -= overlap * ny;
        b2.x += overlap * nx;
        b2.y += overlap * ny;

        // 速度の交換（法線方向成分）
        const v1n = b1.vx * nx + b1.vy * ny;
        const v2n = b2.vx * nx + b2.vy * ny;
        const dvNorm = v1n - v2n;

        if (dvNorm > 0) {
          b1.vx -= dvNorm * nx;
          b1.vy -= dvNorm * ny;
          b2.vx += dvNorm * nx;
          b2.vy += dvNorm * ny;
        }
      }
    }
  }
}

function startGame() {
  balls.length = 0;
  effects.length = 0;
  removedBallCount = 0;
  gameState = 'playing';
  startTime = Date.now();
  autoGenerateBall();
}

function loop() {
  if (gameState === 'game_over') {
    // 画面を少し暗くする
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 結果表示
    ctx.font = "bold 80px 'Hiragino Kaku Gothic ProN', 'Meiryo', sans-serif";
    ctx.fillStyle = "gold";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("おしまい！", canvas.width / 2, canvas.height / 2 - 80);

    ctx.font = "bold 50px 'Hiragino Kaku Gothic ProN', 'Meiryo', sans-serif";
    ctx.fillStyle = "white";
    ctx.fillText(`けっか: ${removedBallCount}こ`, canvas.width / 2, canvas.height / 2 + 40);

    // 「もういっかい」ボタンの描画
    const button = {
      x: canvas.width / 2 - 125,
      y: canvas.height / 2 + 100,
      width: 250,
      height: 60
    };
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(button.x, button.y, button.width, button.height);
    ctx.font = "bold 30px 'Hiragino Kaku Gothic ProN', 'Meiryo', sans-serif";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("もういっかい", button.x + button.width / 2, button.y + button.height / 2);
  } else if (gameState === 'playing') {
    // 時間の更新とゲームオーバー判定
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, (GAME_DURATION - elapsedTime) / 1000);
    if (remainingTime <= 0) {
      gameState = 'game_over';
      // autoGenerateBall の中の setTimeout は止まらないが、次の呼び出しで gameState チェックに引っかかる
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const ball of balls) {
      ball.update();
    }
    handleCollisions();
    for (const ball of balls) {
      ball.draw(ctx);
    }

    for (let i = effects.length - 1; i >= 0; i--) {
      effects[i].update();
      effects[i].draw(ctx);
      if (effects[i].isDead()) {
        effects.splice(i, 1);
      }
    }

    // 消えたボールの数を表示
    ctx.font = "24px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(`消えたボール: ${removedBallCount}`, canvas.width / 2, canvas.height - 30);

    // 残り時間を表示
    ctx.font = "32px 'Courier New', Courier, monospace";
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.fillText(`のこり: ${remainingTime.toFixed(1)}`, 20, 40);
  } else if (gameState === 'before_start') {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 「はじめる」ボタンの描画
    const button = {
      x: canvas.width / 2 - 125,
      y: canvas.height / 2 - 30,
      width: 250,
      height: 60
    };
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(button.x, button.y, button.width, button.height);
    ctx.font = "bold 30px 'Hiragino Kaku Gothic ProN', 'Meiryo', sans-serif";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("はじめる", button.x + button.width / 2, button.y + button.height / 2);
  }

  requestAnimationFrame(loop);
}

loop();