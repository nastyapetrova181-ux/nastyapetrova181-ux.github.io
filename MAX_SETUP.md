# MAX lead delivery setup

The site can run on GitHub Pages as a static landing page. Static hosting cannot secretly send form data into MAX because a bot token would become public in browser JavaScript.

For real direct delivery into a separate MAX chat, deploy the project on a host with serverless functions, for example Vercel, and set these environment variables:

- `MAX_BOT_TOKEN` - token of the MAX bot
- `MAX_CHAT_ID` - chat id where leads should arrive

The browser sends form text to `/api/max-lead`. If that server endpoint is unavailable, the site falls back to copying the lead text and opening `https://max.ru/75456095`.
