import LibraryModel from "../model/library.model.js";

const LibraryController = {
    getRecentTracks: async (req, res) => {
        const user_id = req.user.id;

        LibraryModel.getRecentTracks(user_id, (error, result) => {
            if (error) {
                return res.status(500).json({ error: error });
            }

            return res.status(200).json(result);
        });
    },

    getRecentAlbums: async (req, res) => {
        const user_id = req.user.id;

        LibraryModel.getRecentAlbums(user_id, (error, result) => {
            if (error) {
                return res.status(500).json({ error: error });
            }

            return res.status(200).json(result);
        });
    },

    getRecentArtists: async (req, res) => {
        const user_id = req.user.id;

        LibraryModel.getRecentArtists(user_id, (error, result) => {
            if (error) {
                return res.status(500).json({ error: error });
            }

            return res.status(200).json(result);
        });
    },
};

export default LibraryController;