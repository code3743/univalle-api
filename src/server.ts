import { app } from "./app.js";
import { env } from "./config/env.js";
import { startNewsScheduler } from "./jobs/newsScheduler.js";

app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
  startNewsScheduler();
});
