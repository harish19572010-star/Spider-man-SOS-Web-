// ---- Web-thread cursor effect ----
// Draws faint threads from a set of anchor points toward the cursor,
// like a spider-sense field reacting to movement.

const canvas = document.getElementById('web-canvas');
const ctx = canvas.getContext('2d');
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let w, h, anchors = [];
let mouse = { x: -9999, y: -9999, active: false };

function resize() {
  w = canvas.width = window.innerWidth * devicePixelRatio;
  h = canvas.height = window.innerHeight * devicePixelRatio;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  buildAnchors();
}

function buildAnchors() {
  anchors = [];
  const cols = 8, rows = 5;
  for (let i = 0; i <= cols; i++) {
    for (let j = 0; j <= rows; j++) {
      anchors.push({
        x: (i / cols) * w,
        y: (j / rows) * h,
      });
    }
  }
}

function distance(ax, ay, bx, by) {
  const dx = ax - bx, dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

function draw() {
  ctx.clearRect(0, 0, w, h);

  // faint static grid threads between neighboring anchors
  ctx.strokeStyle = 'rgba(226, 54, 54, 0.06)';
  ctx.lineWidth = 1;
  const cols = 9, rows = 6;
  for (let i = 0; i < anchors.length; i++) {
    const a = anchors[i];
    // connect to right neighbor and bottom neighbor based on grid layout
    const right = anchors[i + rows + 1];
    const down = anchors[i + 1];
    if (right && Math.abs(right.y - a.y) < 2) {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(right.x, right.y);
      ctx.stroke();
    }
    if (down && (i + 1) % (rows + 1) !== 0) {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(down.x, down.y);
      ctx.stroke();
    }
  }

  // reactive threads pulling toward the cursor
  if (mouse.active) {
    const mx = mouse.x * devicePixelRatio;
    const my = mouse.y * devicePixelRatio;
    const radius = 260 * devicePixelRatio;

    for (const a of anchors) {
      const d = distance(a.x, a.y, mx, my);
      if (d < radius) {
        const strength = 1 - d / radius;
        ctx.strokeStyle = `rgba(226, 54, 54, ${0.35 * strength})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(mx, my);
        ctx.stroke();
      }
    }

    // small pulse dot at the cursor
    ctx.fillStyle = 'rgba(226, 54, 54, 0.5)';
    ctx.beginPath();
    ctx.arc(mx, my, 3 * devicePixelRatio, 0, Math.PI * 2);
    ctx.fill();
  }

  if (!prefersReduced) requestAnimationFrame(draw);
}

window.addEventListener('resize', resize);
window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouse.active = true;
});
window.addEventListener('mouseleave', () => { mouse.active = false; });

resize();
if (!prefersReduced) {
  requestAnimationFrame(draw);
} else {
  draw(); // draw a single static frame
}

// ---- Signal form ----
const form = document.getElementById('signal-form');
const note = document.getElementById('form-note');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputs = form.querySelectorAll('input');
    const location = inputs[0].value.trim();
    note.textContent = `Signal received from ${location || 'your location'}. Patrol route updated.`;
    form.reset();
    setTimeout(() => { note.textContent = ''; }, 5000);
  });
}