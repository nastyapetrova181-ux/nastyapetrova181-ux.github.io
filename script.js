const form = document.querySelector("#brief-form");
const note = document.querySelector("#form-note");

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
