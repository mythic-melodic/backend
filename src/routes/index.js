import accountRoute from './account.route.js';
import playlistRoute from './playlist.route.js';
function route(app) {
    app.use('/api/v1/account', accountRoute);
    app.use('/api/v1/playlist', playlistRoute);

}
export default route;