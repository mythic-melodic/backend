import accountRoute from "./account.route.js";
import playlistRoute from "./playlist.route.js";
import artistRoute from "./artist.route.js";
import trackRoute from "./track.route.js";
import merchandiseRoute from "./merchandise.route.js";

import musicRoute from "./music.route.js";
import favoriteRoute from "./favorite.route.js";
import libraryRoute from "./library.route.js";
import cartRoute from "./cart.route.js"
import OrderRoute from "./order.route.js"
import SearchRoute from "./search.route.js";
import AlbumRoute from "./album.route.js";
function route(app) {
    app.use('/api/v1/account', accountRoute);
    app.use('/api/v1/artist', artistRoute);
    app.use('/api/v1/playlist', playlistRoute);
    app.use('/api/v1/track', trackRoute);
    app.use("/api/v1/merchandise", merchandiseRoute);
    app.use('/api/v1/music', musicRoute);
    app.use('/api/v1/favorite', favoriteRoute);
    app.use('/api/v1/library', libraryRoute);
    app.use('/api/v1/cart', cartRoute);
    app.use('/api/v1/order', OrderRoute);
    app.use('/api/v1/search', SearchRoute);
    app.use('/api/v1/album', AlbumRoute);
}


export default route;
