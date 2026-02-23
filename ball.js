import { getRandomColor, shadeColor } from './utils.js';

// ----------------------------
// Ballクラス
// ----------------------------
export class Ball {
  static HIGHLIGHT_OFFSET_FACTOR = -0.3;
  static GRADIENT_INNER_RADIUS_FACTOR = 0.2;
  static HIGHLIGHT_RADIUS_FACTOR = 0.4;
  static SHINE_ALPHA = 0.25;

  constructor(x, y, canvas) {
    this.x = x;
    this.y = y;
    this.canvas = canvas;

    // 画面幅の5%を半径にする
    this.radius = this.canvas.width * 0.05;
    this.color = getRandomColor();
    
    // ⭐ ランダムな方向へ動かす
    const angle = Math.random() * Math.PI * 2;
    const minSpeed = 3;
    const maxSpeed = 10;
    const speed = Math.random() * (maxSpeed - minSpeed) + minSpeed;

    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
  }
  
  update() {
     this.x += this.vx;
     this.y += this.vy;

     // 壁反射
     if (this.x - this.radius < 0 || this.x + this.radius > this.canvas.width) {
       this.vx *= -1;
     }

     if (this.y - this.radius < 0 || this.y + this.radius > this.canvas.height) {
       this.vy *= -1;
     }
  }

  draw(ctx) {
    const highlightOffsetX = this.radius * Ball.HIGHLIGHT_OFFSET_FACTOR;
    const highlightOffsetY = this.radius * Ball.HIGHLIGHT_OFFSET_FACTOR;
    
    //グラデーション
    const gradient = ctx.createRadialGradient(
      this.x + highlightOffsetX,
      this.y + highlightOffsetY,
      this.radius * Ball.GRADIENT_INNER_RADIUS_FACTOR,
      this.x,
      this.y,
      this.radius
    );

    gradient.addColorStop(0, "white");
    gradient.addColorStop(0.2, this.color);
    gradient.addColorStop(1, shadeColor(this.color, -40));
    
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill()
    ctx.closePath();
    
    // 上部の光沢ハイライト
    ctx.beginPath();
    ctx.arc(
      this.x + highlightOffsetX,
      this.y + highlightOffsetY,
      this.radius * Ball.HIGHLIGHT_RADIUS_FACTOR,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = `rgba(255,255,255,${Ball.SHINE_ALPHA})`;
    ctx.fill();
    ctx.closePath();
  }

  contains(px, py) {
    const dx = this.x - px;
    const dy = this.y - py;
    return Math.sqrt(dx * dx + dy * dy) <= this.radius;
  }
  
  intersects(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.radius + other.radius;
  }
}