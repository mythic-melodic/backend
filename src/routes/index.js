import accountRoute from "./account.route.js";
import playlistRoute from "./playlist.route.js";
import artistRoute from "./artist.route.js";
import trackRoute from "./track.route.js";
function route(app) {
    app.use('/api/v1/account', accountRoute);
    app.use('/api/v1/artist', artistRoute);
    app.use('/api/v1/playlist', playlistRoute);
    app.use('/api/v1/track', trackRoute);
}


export default route;
