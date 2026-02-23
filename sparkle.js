// ----------------------------
// 星型キラキラエフェクト
// ----------------------------
export class Sparkle {
  constructor(x, y) {
    this.stars = [];

    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;

      this.stars.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 10 + 8,
        rotation: Math.random() * Math.PI,
        life: 40
      });
    }
  }

  update() {
    for (const s of this.stars) {
      s.x += s.vx;
      s.y += s.vy;
      s.rotation += 0.1;
      s.life--;
    }
    this.stars = this.stars.filter(s => s.life > 0);
  }

  drawStar(ctx, x, y, radius, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();

    for (let i = 0; i < 5; i++) {
      ctx.lineTo(
          Math.cos((18 + i * 72) * Math.PI / 180) * radius,
        -Math.sin((18 + i * 72) * Math.PI / 180) * radius
      );
      ctx.lineTo(
        Math.cos((54 + i * 72) * Math.PI / 180) * (radius / 2),
        -Math.sin((54 + i * 72) * Math.PI / 180) * (radius / 2)
      );
    }

    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  draw(ctx) {
    for (const s of this.stars) {
      ctx.globalAlpha = s.life / 40;
      ctx.fillStyle = "gold";
      this.drawStar(ctx, s.x, s.y, s.size, s.rotation);
    }
    ctx.globalAlpha = 1;
  }

  isDead() {
    return this.stars.length === 0;
  }
}