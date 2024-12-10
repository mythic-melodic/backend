import express from "express";
const router = express.Router();
import SearchController from "../controller/SearchController.js";

router.get("/tracks", SearchController.searchTracks);
router.get("/albums", SearchController.searchAlbums);
router.get("/artists", SearchController.searchArtists);

export default router;