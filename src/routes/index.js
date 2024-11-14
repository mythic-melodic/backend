import accountRoute from "./account.route.js";
import playlistRoute from "./playlist.route.js";
import artistRoute from "./artist.route.js";
import driveRoute from "./drive.route.js";
function route(app) {
    app.use('/api/v1/account', accountRoute);
    app.use('/api/v1/drive', driveRoute);
    app.use('/api/v1/artist', artistRoute);
    app.use('/api/v1/playlist', playlistRoute);
}


export default route;
