import FavoriteModel from "../model/favorite.model.js";

class FavoriteController {
    async addFavorite(req, res) {
        const { track_id } = req.body;
        const user_id = req.user.id;
        
        // Validate user_id and track_id
        if (!user_id || !track_id) {
            return res.status(400).send("User ID and Track ID are required");
        }

        try {
            FavoriteModel.addFavorite(user_id, track_id, (error, result) => {
                if (error) {
                    res.status(500).send("Error: " + error.message);
                }
                res.status(200).send(result);
            });
        } catch (error) {
            res.status(500).send("Error: " + error.message);
        }
    }
    async getFavoriteByUser(req, res) {
        const user_id = req.user.id;
        const page = parseInt(req.query.page) || 1; // Mặc định page = 1 nếu không truyền
        const limit = parseInt(req.query.limit) || 10; // Mặc định limit = 10 nếu không truyền
        const offset = (page - 1) * limit; // Tính toán offset

        // Validate user_id
        if (!user_id) {
            return res.status(400).send("User ID is required");
        }

        try {
            FavoriteModel.getFavoriteByUser(user_id, limit, offset, (error, result) => {
                if (error) {
                    res.status(500).send("Error: " + error.message);
                }
                res.status(200).send(result);
            });
        } catch (error) {
            res.status(500).send("Error: " + error.message);
        }
    }
    async getFavoriteByTrack(req, res) {
        const { track_id } = req.params;

        // Validate track_id
        if (!track_id) {
            return res.status(400).send("Track ID is required");
        }

        try {
            FavoriteModel.getFavoriteByTrack(track_id, (error, result) => {
                if (error) {
                    res.status(500).send("Error: " + error.message);
                }
                res.status(200).send(result);
            });
        } catch (error) {
            res.status(500).send("Error: " + error.message);
        }
    }
    async removeFavorite(req, res) {
        const { track_id } = req.body;
        const user_id = req.user.id;
        
        // Validate user_id and track_id
        if (!user_id || !track_id) {
            return res.status(400).send("User ID and Track ID are required");
        }

        try {
            FavoriteModel.removeFavorite(user_id, track_id, (error, result) => {
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

export default new FavoriteController();