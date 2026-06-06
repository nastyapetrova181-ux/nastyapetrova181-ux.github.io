const MAX_API_URL = "https://platform-api.max.ru/messages";

function json(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    json(response, 405, { ok: false, error: "Method not allowed" });
    return;
  }

  const token = process.env.MAX_BOT_TOKEN;
  const chatId = process.env.MAX_CHAT_ID;

  if (!token || !chatId) {
    json(response, 500, { ok: false, error: "MAX_BOT_TOKEN and MAX_CHAT_ID are required" });
    return;
  }

  let body;
  try {
    if (typeof request.body === "object" && request.body !== null) {
      body = request.body;
    } else if (typeof request.body === "string") {
      body = JSON.parse(request.body || "{}");
    } else {
      const chunks = [];
      for await (const chunk of request) chunks.push(chunk);
      body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
    }
  } catch {
    json(response, 400, { ok: false, error: "Invalid JSON" });
    return;
  }

  const message = String(body.message || "").trim();
  if (!message) {
    json(response, 400, { ok: false, error: "Message is required" });
    return;
  }

  const maxResponse = await fetch(`${MAX_API_URL}?chat_id=${encodeURIComponent(chatId)}`, {
    method: "POST",
    headers: {
      "Authorization": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: message }),
  });

  if (!maxResponse.ok) {
    json(response, 502, { ok: false, error: "MAX API request failed" });
    return;
  }

  json(response, 200, { ok: true });
}
