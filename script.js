const form = document.querySelector("#brief-form");
const note = document.querySelector("#form-note");
const canvas = document.querySelector("#motion-bg");
const ctx = canvas?.getContext("2d");
const backToTop = document.querySelector("#back-to-top");
const telegramLink = document.querySelector(".telegram-link");

let width = 0;
let height = 0;
let dpr = 1;
let pointer = { x: 0.72, y: 0.2, tx: 0.72, ty: 0.2 };
let particles = [];

function resizeMotion() {
  if (!canvas || !ctx) return;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = Math.max(34, Math.min(76, Math.floor(width / 18)));
  particles = Array.from({ length: count }, (_, index) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: 0.8 + Math.random() * 2.4,
    a: 0.16 + Math.random() * 0.34,
    speed: 0.18 + Math.random() * 0.55,
    phase: Math.random() * Math.PI * 2,
    tone: index % 3,
  }));
}

function setPointer(clientX, clientY) {
  pointer.tx = clientX / Math.max(width, 1);
  pointer.ty = clientY / Math.max(height, 1);
  document.documentElement.style.setProperty("--mx", `${Math.round(pointer.tx * 100)}%`);
  document.documentElement.style.setProperty("--my", `${Math.round(pointer.ty * 100)}%`);
}

function drawMotion(time = 0) {
  if (!canvas || !ctx) return;
  pointer.x += (pointer.tx - pointer.x) * 0.06;
  pointer.y += (pointer.ty - pointer.y) * 0.06;

  ctx.clearRect(0, 0, width, height);

  const glowX = pointer.x * width;
  const glowY = pointer.y * height;
  const gradient = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, Math.max(width, height) * 0.74);
  gradient.addColorStop(0, "rgba(224, 189, 119, 0.22)");
  gradient.addColorStop(0.32, "rgba(159, 182, 199, 0.10)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  for (const p of particles) {
    const pull = 20 + p.tone * 12;
    const driftX = Math.cos(time * 0.00032 * p.speed + p.phase) * pull;
    const driftY = Math.sin(time * 0.00026 * p.speed + p.phase) * pull;
    const x = p.x + driftX + (pointer.x - 0.5) * (p.tone + 1) * 32;
    const y = p.y + driftY + (pointer.y - 0.5) * (p.tone + 1) * 24;

    ctx.beginPath();
    ctx.arc(x, y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.tone === 0
      ? `rgba(224, 189, 119, ${p.a})`
      : p.tone === 1
        ? `rgba(159, 182, 199, ${p.a * 0.72})`
        : `rgba(184, 116, 85, ${p.a * 0.66})`;
    ctx.fill();

    const dx = x - glowX;
    const dy = y - glowY;
    const distance = Math.hypot(dx, dy);
    if (distance < 170) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(glowX, glowY);
      ctx.strokeStyle = `rgba(248, 243, 234, ${0.13 * (1 - distance / 170)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  requestAnimationFrame(drawMotion);
}

if (canvas && ctx) {
  resizeMotion();
  window.addEventListener("resize", resizeMotion);
  window.addEventListener("pointermove", (event) => setPointer(event.clientX, event.clientY), { passive: true });
  requestAnimationFrame(drawMotion);
}

if (backToTop) {
  const toggleBackToTop = () => {
    backToTop.classList.toggle("is-visible", window.scrollY > 520);
  };

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", toggleBackToTop, { passive: true });
  toggleBackToTop();
}

if (telegramLink) {
  telegramLink.addEventListener("click", (event) => {
    event.preventDefault();
    const webLink = telegramLink.href;
    const openedAt = Date.now();
    window.location.href = "tg://resolve?domain=Anastasia_Petrova181";

    window.setTimeout(() => {
      if (Date.now() - openedAt < 1600) {
        window.location.href = webLink;
      }
    }, 900);
  });
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = data.get("name") || "";
    const task = data.get("task") || "";
    const budget = data.get("budget") || "не указан";
    const message = `Здравствуйте, Анастасия. Меня зовут ${name}. Задача: ${task}. Бюджет: ${budget}.`;

    try {
      await navigator.clipboard.writeText(message);
      note.textContent = "Заявка скопирована. Откройте MAX и вставьте сообщение в чат.";
    } catch {
      note.textContent = "MAX откроется сейчас. Скопируйте текст заявки из формы вручную.";
    }

    window.open("https://max.ru/75456095", "_blank", "noopener,noreferrer");
  });
}
