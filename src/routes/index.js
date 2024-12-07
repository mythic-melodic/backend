import accountRoute from "./account.route.js";
import playlistRoute from "./playlist.route.js";
import artistRoute from "./artist.route.js";
import trackRoute from "./track.route.js";
import musicRoute from "./music.route.js";
import favoriteRoute from "./favorite.route.js";
import libraryRoute from "./library.route.js";
function route(app) {
    app.use('/api/v1/account', accountRoute);
    app.use('/api/v1/artist', artistRoute);
    app.use('/api/v1/playlist', playlistRoute);
    app.use('/api/v1/track', trackRoute);
    app.use('/api/v1/music', musicRoute);
    app.use('/api/v1/favorite', favoriteRoute);
    app.use('/api/v1/library', libraryRoute);

}


export default route;
