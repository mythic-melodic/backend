import PlayListModel from "../model/search.model.js";

class SearchController {
    async searchTracks(req, res) {
        const search_query = req.query.q;
        try {
            const tracks = await PlayListModel.searchTrack(search_query);
            return res.status(200).json(tracks);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    async searchAlbums(req, res) {
        const search_query = req.query.q;
        try {
            const albums = await PlayListModel.searchAlbum(search_query);
            return res.status(200).json(albums);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    async searchArtists(req, res) {
        const search_query = req.query.q;
        try {
            const artists = await PlayListModel.searchArtist(search_query);
            return res.status(200).json(artists);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    async browseByGenre(req, res) {
        const genre_id = req.query.genre_id;
        const page = parseInt(req.query.page) || 1; // Mặc định page = 1 nếu không truyền
        const limit = parseInt(req.query.limit) || 10; // Mặc định limit = 10 nếu không truyền
        const offset = (page - 1) * limit; // Tính toán offset
        try {
            const tracks = await PlayListModel.browseByGenre(genre_id, limit, offset);
            return res.status(200).json(tracks);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

}

export default new SearchController();