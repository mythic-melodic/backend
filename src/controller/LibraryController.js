import LibraryModel from "../model/library.model.js";

const LibraryController = {
    getRecentTracks: async (req, res) => {
        const user_id = req.user.id;
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10; 
        const offset = (page - 1) * limit; 
        LibraryModel.getRecentTracks(user_id, limit, offset, (error, result) => {
            if (error) {
                return res.status(500).json({ error: error });
            }

            return res.status(200).json(result);
        });
    },

    getRecentAlbums: async (req, res) => {
        const user_id = req.user.id;
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10; 
        const offset = (page - 1) * limit; 

        LibraryModel.getRecentAlbums(user_id, limit, offset, (error, result) => {
            if (error) {
                return res.status(500).json({ error: error });
            }

            return res.status(200).json(result);
        });
    },

    getRecentArtists: async (req, res) => {
        const user_id = req.user.id;
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10; 
        const offset = (page - 1) * limit; 

        LibraryModel.getRecentArtists(user_id, limit, offset, (error, result) => {
            if (error) {
                return res.status(500).json({ error: error });
            }

            return res.status(200).json(result);
        });
    },
};

export default LibraryController;