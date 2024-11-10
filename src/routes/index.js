import accountRoute from "./account.route.js";
import artistRoute from "./artist.route.js";

function route(app) {
  app.use("/api/account", accountRoute);
  app.use("/api/artist", artistRoute);
}

export default route;
