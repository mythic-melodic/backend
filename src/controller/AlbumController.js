import AlbumModel from "../model/album.model.js";

class AlbumController {
    async getAlbumDetails(req, res) {
        const albumId = req.params.albumId;

        try {
            AlbumModel.getAlbumDetails(albumId, (error, result) => {
                if (error) {
                    res.status(500).send("Error: " + error.message);
                }
                res.status(200).send(result);
            });
        } catch (error) {
            res.status(500).send("Error: " + error.message);
        }
    }

    async getAllTracksInAlbum(req, res) {
        const albumId = req.params.albumId;

        try {
            AlbumModel.getAllTracksInAlbum(albumId, (error, result) => {
                if (error) {
                    res.status(500).send("Error: " + error.message);
                }
                res.status(200).send(result);
            });
        } catch (error) {
            res.status(500).send("Error: " + error.message);
        }
    }

    async getRelatedMerchandises(req, res) {
        const albumId = req.params.albumId;

        try {
            AlbumModel.getRelatedMerchandises(albumId, (error, result) => {
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

export default new AlbumController();