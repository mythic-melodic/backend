import PlayListModel from "../model/playlist.model.js";
import useGoogleDriveUpload from '../hooks/upload.media.js';

class PlaylistController {
    async createPlaylist(req, res) {
        const { name, description } = req.body;
        const creator_id = req.user.id;
        let cover;

        if (req.file) {
          cover = await useGoogleDriveUpload(req, res); // Assign the result to the outer variable
        } else {
          cover = null; // Set cover to null if no file is uploaded
        }
        
        try {
            PlayListModel.createPlayList(name, creator_id, cover, description, (error, result) => {
                if (error) {
                    res.status(400).send(error);
                }
                res.status(200).send({'message': result.message,'playlist_id': result.playlist_id, 'cover': cover});
                console.log('Playlist created:', result);
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
        // console.log('Received playlist id:', playlist_id);
        try {
            PlayListModel.getPlaylistById(playlist_id, (error, result) => {
                if (error) {
                    return res.status(400).send(error);
                }
    
                if (result.length === 0) {
                    return res.status(404).json({ message: 'Playlist not found' });
                }
    
                const playlist = result;
    
                if (playlist.is_public) {
                    return res.status(200).json(playlist);
                }
    
                // if (playlist.creator_id !== req.user.id && req.user.role !== 'admin') {
                //     return res.status(403).json({ message: 'You do not have permission to access this playlist' });
                // }
    
                res.status(200).json(playlist);
            });
        } catch (error) {
            console.error("Error getting playlist by ID01:", error);
            return res.status(500).send("Error: " + error.message);
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
        const cover = await useGoogleDriveUpload(req, res);
        try {
            PlayListModel.updatePlaylist(playlist_id, name, description, cover, (error, result) => {
                if (error) {
                    res.status(400).send(error);
                }
                res.status(200).send({'message': "Playlist updated", 'playlist_id': playlist_id, 'cover': cover});
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
                res.status(200).send({success: true, message: "Playlist deleted successfully", result});
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
        const { track_id, playlist_id } = req.body;
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