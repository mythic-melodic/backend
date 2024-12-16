import express from 'express';
const router = express.Router();
import AlbumController from '../controller/AlbumController.js';

import tokenMiddleware from '../middlewares/token.middleware.js';

router.get('/:albumId', AlbumController.getAlbumDetails);
router.get('/:albumId/tracks', AlbumController.getAllTracksInAlbum);
router.get('/:albumId/merchandises', AlbumController.getRelatedMerchandises);


export default router;