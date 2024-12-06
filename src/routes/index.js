import accountRoute from "./account.route.js";
import playlistRoute from "./playlist.route.js";
import artistRoute from "./artist.route.js";
// import driveRoute from "./drive.route.js";
// import trackRoute from "./track.route.js";
import merchandiseRoute from "./merchandise.route.js";
import shopRoute from "./shop.route.js";


function route(app) {
  app.use("/api/v1/account", accountRoute);
  // app.use("/api/v1/drive", driveRoute);
  app.use("/api/v1/artist", artistRoute);
  app.use("/api/v1/playlist", playlistRoute);
  // app.use("/api/v1/track", trackRoute);
  app.use("/api/v1/merchandise", merchandiseRoute);
  app.use("/api/v1/shop", shopRoute);
}

export default route;
