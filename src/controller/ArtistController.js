import ArtistModel from "../model/artist.model.js";

class ArtistController {
  async getTopTracks(req, res) {
    const { id: artist_id } = req.params;

    // Validate artist_id
    if (!artist_id) {
      return res.status(400).send("Artist ID is required");
    }

    try {
      ArtistModel.getTopTracks(artist_id, (error, result) => {
        if (error) {
          res.status(500).send("Error: " + error.message);
        }
        res.status(200).send(result.rows);
      });
    } catch (error) {
      res.status(500).send("Error: " + error.message);
    }
  }
}

export default new ArtistController();
