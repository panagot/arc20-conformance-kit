import { createApp } from "./app.js";

const app = createApp();
const port = Number(process.env.PORT ?? 8787);

app.listen(port, () => {
  console.log(`ARC-20 API server listening on http://localhost:${port}`);
});
