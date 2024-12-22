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
        const albumId = req.params.id;

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
    async getTracksByAlbumId(req, res) {
        const { id } = req.params;
        try {
            AlbumModel.getTracksByAlbumId(id, (error, result) => {
                if (error) {
                    console.log(error);
                    return res.status(400).send(error);
                }
                res.status(200).send(result);
            });
        } catch (error) {
            res.status(500).send('Error: ' + error.message);
        }
    }
    async getAlbumById(req, res) {
        const { id } = req.params;
        try {
            AlbumModel.getAlbumByID(id, (error, result) => {
                if (error) {
                    return res.status(400).send.error; 
                }
                // console.log(result);
                res.status(200).send(result[0]);
        });
        } catch (error) {
            res.status(500).send('Error: ' + error.message);
        }
    }   
}
export default new AlbumController();