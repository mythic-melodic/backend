import express from 'express';
import musicController from '../controller/MusicController.js';
import tokenMiddleware from '../middlewares/token.middleware.js';

const router = express.Router();


router.post('/today-top-hits', musicController.updateTodayTopHitsPlaylist);
router.post('/melodic-top-tracks', musicController.updateMelodicTopTracksPlaylist);
router.post('/today-top-fav', musicController.updateTodayTopFavPlaylit);
router.post('/play-record', tokenMiddleware.authenticateToken, musicController.addPlayRecord);
router.get('/play-record', musicController.getPlayRecordByUser);
router.get('/new-releases', musicController.getNewRelease);
router.get('/top-albums', musicController.getTopAlbums);
router.get('/top-artists', musicController.getTopArtists);
router.get('/public-playlists', musicController.getPublicPlaylist);
router.get('/play-record/:track_id', musicController.getPlayRecordByTrack);

export default router;