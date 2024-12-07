import express from 'express';
import libraryController from '../controller/LibraryController.js';
import tokenMiddleware from '../middlewares/token.middleware.js';

const router = express.Router();

router.get('/recent-tracks', tokenMiddleware.authenticateToken, libraryController.getRecentTracks);
router.get('/recent-albums', tokenMiddleware.authenticateToken, libraryController.getRecentAlbums);
router.get('/recent-artists', tokenMiddleware.authenticateToken, libraryController.getRecentArtists);

export default router;