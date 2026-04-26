import { app } from "./app.js";
import { env } from "./utils/env.js";

app.listen(env.PORT, () => {
  console.log(`Money Buddy API listening on ${env.PORT}`);
});
