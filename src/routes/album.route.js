import express from 'express';
const router = express.Router();
import albumController from '../controller/AlbumController.js';
import tokenMiddleware from '../middlewares/token.middleware.js';

router.get('/:albumId', albumController.getAlbumDetails);
router.get('/:albumId/tracks', albumController.getAllTracksInAlbum);
router.get('/:id/merchandises', albumController.getRelatedMerchandises);



router.get('/:id/track', albumController.getTracksByAlbumId);
router.get('/:id/details', albumController.getAlbumById);

export default router;