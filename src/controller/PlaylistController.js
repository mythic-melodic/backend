import PlayListModel from "../model/playlist.model.js";

class PlaylistController {
    async createPlaylist(req, res) {
        const { name, description } = req.body;
        const creator_id = req.user.id;
        try {
            PlayListModel.createPlayList(name, creator_id, description, (error, result) => {
                if (error) {
                    res.status(400).send(error);
                }
                res.status(200).send({'message': result.message, 'playlist_id': result.playlist_id});
                console.log("result", result)
            });
        } catch (error) {
            res.status(500).send("Error: " + error.message);
        }
    }

    async getAllPlaylists(req, res) {
        try {
            PlayListModel.getAllPlaylists((error, result) => {
                if (error) {
                    res.status(400).send(error);
                }
                res.status(200).send(result);
            });
        } catch (error) {
            res.status(500).send("Error: " + error.message);
        }
    }

    async getPlaylistById(req, res) {
        const playlist_id = req.params.id;
        try {
            PlayListModel.getPlaylistById(playlist_id, (error, result) => {
                if (error) {
                    res.status(400).send(error);
                }

                if (result[0].creator_id !== req.user.id) {
                    return res.status(403).json({ message: 'You do not have permission to access this playlist' });
                }
                res.status(200).send(result);

            });
        } catch (error) {
            res.status(500).send("Error: " + error.message);
        }
    }

    async getAllPlaylistsByCreator(req, res) {
        const creator_id = req.user.id;
        try {
            PlayListModel.getAllPlaylistsByCreator(creator_id, (error, result) => {
                if (error) {
                    res.status(400).send(error);
                }
                res.status(200).send(result);
            });
        } catch (error) {
            res.status(500).send("Error: " + error.message);
        }
    }

    async updatePlaylist(req, res) {
        const playlist_id = req.params.id;
        const { name, description } = req.body;
        try {
            PlayListModel.updatePlaylist(playlist_id, name, description, (error, result) => {
                if (error) {
                    res.status(400).send(error);
                }
                res.status(200).send({'message': result});
            });
        } catch (error) {
            res.status(500).send("Error: " + error.message);
        }
    }

    async deletePlaylist(req, res) {
        const playlist_id = req.params.id;
        try {
            PlayListModel.deletePlaylist(playlist_id, (error, result) => {
                if (error) {
                    res.status(400).send(error);
                }
                res.status(200).send({"message": result});
            });
        } catch (error) {
            res.status(500).send("Error: " + error.message);
        }
    }

    async getAllTracksInPlaylist(req, res) {
        const playlist_id = req.params.id;
        try {
            PlayListModel.getAllTracksInPlaylist(playlist_id, (error, result) => {
                if (error) {
                    res.status(400).send(error);
                }
                res.status(200).send(result);
            });
        } catch (error) {
            res.status(500).send("Error: " + error.message);
        }
    }

    async addTrackToPlaylist(req, res) {
        const playlist_id = req.params.id;
        const { track_id } = req.body;
        try {
            PlayListModel.addTrackToPlaylist(playlist_id, track_id, (error, result) => {
                if (error) {
                    res.status(400).send(error);
                }
                res.status(200).send({"message": result});
            });
        } catch (error) {
            res.status(500).send("Error: " + error.message);
        }
    }
    
    async deleteTrackFromPlaylist(req, res) {
        const playlist_id = req.params.id;
        const { track_id } = req.body;
        try {
            PlayListModel.deleteTrackFromPlaylist(playlist_id, track_id, (error, result) => {
                if (error) {
                    res.status(400).send(error);
                }
                res.status(200).send({"message": result});
            });
        } catch (error) {
            res.status(500).send("Error: " + error.message);
        }
    }

    // async changeTrackOrder(req, res) {
    //     const playlist_id = req.params.id;
    //     const { song_id, new_order } = req.body;
    //     try {
    //         PlayListModel.changeTrackOrder(playlist_id, song_id, new_order, (error, result) => {
    //             if (error) {
    //                 res.status(400).send(error);
    //             }
    //             res.status(200).send({"message": result});
    //         });
    //     } catch (error) {
    //         res.status(500).send("Error: " + error.message);
    //     }
    // }
}

export default new PlaylistController();