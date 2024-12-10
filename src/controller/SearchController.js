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

}

export default new SearchController();