import express from 'express';
import favoriteController from '../controller/FavoriteController.js';
import tokenMiddleware from '../middlewares/token.middleware.js';

const router = express.Router();


router.post('/add', tokenMiddleware.authenticateToken, favoriteController.addFavorite);
router.get('/', tokenMiddleware.authenticateToken, favoriteController.getFavoriteByUser);
router.get('/:track_id', tokenMiddleware.authenticateToken, favoriteController.getFavoriteByTrack);
router.delete('/', tokenMiddleware.authenticateToken, favoriteController.removeFavorite);

export default router;