// 🎨 使用する5色
const COLORS = [
  "rgb(255,0,0)",
  "rgb(0,0,255)",
  "rgb(255,255,0)",
  "rgb(0,128,0)",
  "rgb(255,165,0)"
];

export function getRandomColor() {
  const index = Math.floor(Math.random() * COLORS.length);
  return COLORS[index];
}

export function shadeColor(color, percent) {
  const rgb = color.match(/\d+/g).map(Number);

  const r = Math.min(255, Math.max(0, rgb[0] + percent));
  const g = Math.min(255, Math.max(0, rgb[1] + percent));
  const b = Math.min(255, Math.max(0, rgb[2] + percent));

  return `rgb(${r},${g},${b})`;
}