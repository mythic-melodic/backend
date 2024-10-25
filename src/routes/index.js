import accountRoute from './account.route.js';
function route(app) {
    app.use('/api/account', accountRoute);
}
export default route;