import MusicModel from "../model/music.model.js";

class MusicController {
    async addPlayRecord(req, res) {
        const { track_id } = req.body;
        const user_id = req.user.id;
        
        // Validate user_id and track_id
        if (!user_id || !track_id) {
            return res.status(400).send("User ID and Track ID are required");
        }

        try {
            MusicModel.addPlayRecord(user_id, track_id, (error, result) => {
                if (error) {
                    res.status(500).send("Error: " + error.message);
                }
                res.status(200).send(result);
            });
        } catch (error) {
            res.status(500).send("Error: " + error.message);
        }
    }

    async getPlayRecordByUser(req, res) {
        const user_id = req.user.id;

        // Validate user_id
        if (!user_id) {
            return res.status(400).send("User ID is required");
        }

        try {
            MusicModel.getPlayRecordByUser(user_id, (error, result) => {
                if (error) {
                    res.status(500).send("Error: " + error.message);
                }
                res.status(200).send(result);
            });
        } catch (error) {
            res.status(500).send("Error: " + error.message);
        }
    }

    async getPlayRecordByTrack(req, res) {
        const { track_id } = req.params;

        // Validate track_id
        if (!track_id) {
            return res.status(400).send("Track ID is required");
        }

        try {
            MusicModel.getPlayRecordByTrack(track_id, (error, result) => {
                if (error) {
                    res.status(500).send("Error: " + error.message);
                }
                res.status(200).send(result);
            });
        } catch (error) {
            res.status(500).send("Error: " + error.message);
        }
    }

    async updateTodayTopHitsPlaylist(req, res) {
        try {
            MusicModel.updateTodayTopHitsPlaylist((error, result) => {
                if (error) {
                    res.status(500).send("Error: " + error.message);
                }
                res.status(200).send(result);
            });
        } catch (error) {
            res.status(500).send("Error: " + error.message);
        }
    }

    async updateMelodicTopTracksPlaylist(req, res) {
        try {
            MusicModel.updateMelodicTopTracksPlaylist((error, result) => {
                if (error) {
                    res.status(500).send("Error: " + error.message);
                }
                res.status(200).send(result);
            });
        } catch (error) {
            res.status(500).send("Error: " + error.message);
        }
    }

    async updateTodayTopFavPlaylit(req, res) {
        try {
            MusicModel.updateTodayTopFavPlaylist((error, result) => {
                if (error) {
                    res.status(500).send("Error: " + error.message);
                }
                res.status(200).send(result);
            });
        } catch (error) {
            res.status(500).send("Error: " + error.message);
    }

}
    async getNewRelease(req, res) {
        try {
            MusicModel.getNewReleases((error, result) => {
                if (error) {
                    res.status(500).send("Error: " + error.message);
                }
                res.status(200).send(result);
            });
        } catch (error) {
            res.status(500).send("Error: " + error.message);
        }
    }

    async getTopAlbums(req, res) {
        try {
            MusicModel.getTopAlbums((error, result) => {
                if (error) {
                    res.status(500).send("Error: " + error.message);
                }
                res.status(200).send(result);
            });
        } catch (error) {
            res.status(500).send("Error: " + error.message);
        }
    }

    async getTopArtists(req, res) {
        try {
            MusicModel.getTopArtists((error, result) => {
                if (error) {
                    res.status(500).send("Error: " + error.message);
                }
                res.status(200).send(result);
            });
        } catch (error) {
            res.status(500).send("Error: " + error.message);
        }
    }

    async getPublicPlaylist(req, res) {
        try {
            MusicModel.getPublicPlaylists((error, result) => {
                if (error) {
                    res.status(500).send("Error: " + error.message);
                }
                res.status(200).send(result);
            });
        } catch (error) {
            res.status(500).send("Error: " + error.message);
        }
    }


}
export default new MusicController();