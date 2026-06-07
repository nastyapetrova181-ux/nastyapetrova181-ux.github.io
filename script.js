const form = document.querySelector("#brief-form");
const note = document.querySelector("#form-note");
const canvas = document.querySelector("#motion-bg");
const ctx = canvas?.getContext("2d");
const backToTop = document.querySelector("#back-to-top");
const telegramLinks = document.querySelectorAll(".telegram-link");
const checklistModal = document.querySelector("#checklist-modal");
const checklistForm = document.querySelector("#checklist-form");
const checklistNote = document.querySelector("#checklist-note");
const checklistOpeners = document.querySelectorAll("[data-open-checklist]");
const checklistClosers = document.querySelectorAll("[data-close-checklist]");
const orbitMain = document.querySelector("#contact-orbit-main");
const CONTACT_EMAIL = "nastya_petrova181@mail.ru";
const EMAIL_ENDPOINT = `https://formsubmit.co/ajax/${CONTACT_EMAIL}`;

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

async function sendEmailLead(fields, statusNode, successText) {
  if (statusNode) statusNode.textContent = "Отправляю заявку...";

  try {
    const response = await fetch(EMAIL_ENDPOINT, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        _captcha: "false",
        _template: "table",
        ...fields,
      }),
    });

    if (!response.ok) throw new Error("Email service is unavailable");
    if (statusNode) statusNode.textContent = successText;
  } catch {
    if (statusNode) {
      statusNode.textContent = `Не получилось отправить автоматически. Напишите на ${CONTACT_EMAIL} или попробуйте еще раз.`;
    }
  }
}

function openTelegram(webLink) {
  const openedAt = Date.now();
  window.location.href = "tg://resolve?domain=Anastasia_Petrova181";

  window.setTimeout(() => {
    if (Date.now() - openedAt < 1600) {
      window.location.href = webLink;
    }
  }, 900);
}

telegramLinks.forEach((telegramLink) => {
  telegramLink.addEventListener("click", (event) => {
    event.preventDefault();
    openTelegram(telegramLink.href);
  });
});

if (checklistModal) {
  const openChecklist = () => {
    checklistModal.classList.add("is-open");
    checklistModal.setAttribute("aria-hidden", "false");
    checklistModal.querySelector("input")?.focus();
  };

  const closeChecklist = () => {
    checklistModal.classList.remove("is-open");
    checklistModal.setAttribute("aria-hidden", "true");
  };

  checklistOpeners.forEach((button) => button.addEventListener("click", openChecklist));
  checklistClosers.forEach((button) => button.addEventListener("click", closeChecklist));

  checklistModal.addEventListener("click", (event) => {
    if (event.target === checklistModal) closeChecklist();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeChecklist();
  });
}

if (checklistForm) {
  checklistForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(checklistForm);
    const name = data.get("name") || "";
    const phone = data.get("phone") || "";

    await sendEmailLead({
      _subject: "Чек-лист по запуску визуала",
      "Форма": "Получить чек-лист",
      "Имя": name,
      "Телефон": phone,
      "Сообщение": "Хочу получить чек-лист по запуску визуала.",
    }, checklistNote, "Заявка отправлена. Я пришлю чек-лист и уточню задачу.");
  });
}

if (orbitMain) {
  const contacts = [
    {
      kind: "mail",
      href: `mailto:${CONTACT_EMAIL}`,
      color: "#b87455",
      title: "Написать на почту",
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2Zm8 7.5L4 7.7V17h16V7.7l-8 4.8Zm0-2.3L19.4 7H4.6l7.4 3.2Z"/></svg>',
    },
    {
      kind: "tg",
      href: "https://t.me/Anastasia_Petrova181",
      color: "#28a7e8",
      title: "Написать в Telegram",
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.8 4.6 18.6 20c-.2.9-.8 1.1-1.6.7l-4.8-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2L6.5 13.7 1.8 12.2c-1-.3-1-1 .2-1.5L20.4 3.6c.9-.3 1.7.2 1.4 1Z"/></svg>',
    },
    {
      kind: "tel",
      href: "tel:+79885829553",
      color: "#d5ad65",
      title: "Позвонить",
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8c1.5 3 3.9 5.4 6.9 6.9l2.3-2.3c.3-.3.8-.4 1.2-.3 1.3.4 2.6.6 4 .6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C11.1 21 3 12.9 3 3c0-.6.4-1 1-1h3.3c.6 0 1 .4 1 1 0 1.4.2 2.7.6 4 .1.4 0 .9-.3 1.2l-2 2.6Z"/></svg>',
    },
  ];
  let contactIndex = 0;
  let currentContact = contacts[0];

  const updateOrbit = () => {
    const item = contacts[contactIndex % contacts.length];
    currentContact = item;
    orbitMain.innerHTML = item.icon;
    orbitMain.href = item.href;
    orbitMain.setAttribute("aria-label", item.title);
    orbitMain.title = item.title;
    orbitMain.style.background = item.color;
    contactIndex += 1;
  };

  orbitMain.addEventListener("click", (event) => {
    if (currentContact.kind === "tg") {
      event.preventDefault();
      openTelegram(currentContact.href);
    }
  });

  updateOrbit();
  window.setInterval(updateOrbit, 2400);
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".section, .service-card, .case-card, .review-grid article, .faq-list details").forEach((element) => {
    element.classList.add("reveal");
    revealObserver.observe(element);
  });
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = data.get("name") || "";
    const task = data.get("task") || "";
    const budget = data.get("budget") || "не указан";

    await sendEmailLead({
      _subject: "Заявка с сайта Анастасии Петровой",
      "Форма": "Рассказать о задаче",
      "Имя": name,
      "Задача": task,
      "Бюджет": budget,
    }, note, "Заявка отправлена. Я скоро отвечу на почту или свяжусь удобным способом.");
  });
}
