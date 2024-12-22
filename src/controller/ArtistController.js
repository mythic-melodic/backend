import ArtistModel from "../model/artist.model.js";
import useGoogleDriveUpload from "../hooks/upload.media.js";
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
        res.status(200).send(result);
      });
    } catch (error) {
      res.status(500).send("Error: " + error.message);
    }
  }
  async getLastestTracks(req, res) {
    const { id } = req.params;
    // Validate artist_id
    if (!id) {
      return res.status(400).send("Artist ID is required");
    }
    try {
      ArtistModel.getLastestTracks(id, (error, result) => {
        if (error) {
          res.status(500).send("Error: " + error.message);
        }
        res.status(200).send(result);
      });
    } catch (error) {
      res.status(500).send("Error: " + error.message);
    }
  }
  async create(req, res) {
    const { artist_name, artist_bio, artist_img } = req.body;
    ArtistModel.create(artist_name, artist_bio, artist_img, (error, result) => {
      if (error) {
        return res.status(500).json({ error });
      }
      return res.status(201).send(result);
    });
  }
  async getById(req, res) {
    const { id } = req.params;
    ArtistModel.getById(id, (error, result) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ error });
      }
      return res.status(200).send(result);
    });
  }
  async getAllArtist(req, res) {
    try {
      ArtistModel.getAll((error, result) => {
        if (error) {
          console.error("Database error:", error);
          return res.status(500).json({ error });
        }
        return res.status(200).send(result.rows);
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      return res.status(500).json({ error: "Unexpected error occurred" });
    }
  }
  async addAlbum(req, res) {
    const album = req.body;
    console.log("Album:", album);
    const cover = await useGoogleDriveUpload(req, res);
    // const cover = '1uPpcuN038RVhwU-IHLHSsCxG61lpCHay';
    ArtistModel.addAlbum(album, cover, (error, result) => {
      if (error) {
        return res.status(500).json({ error });
      }
      return res
        .status(201)
        .send({ success: true, message: "Album added successfully", result });
    });
  }
  async getAlbums(req, res) {
    const { id } = req.params;
    ArtistModel.getAlbums(id, (error, result) => {
      if (error) {
        console.error("Database error:", error);
        return res.status(500).json({ error });
      }
      return res.status(200).send(result);
    });
  }
  async getAllTracksPending(req, res) {
    const { id } = req.params;
    ArtistModel.getAllTracksPending(id, (error, result) => {
      if (error) {
        return res.status(404).json({ message: error });
      }
      return res.status(200).json(result);
    });
  }

  async approveCollaboration(req, res) {
    const { trackId, artistId } = req.body;
    ArtistModel.approveCollaboration(trackId, artistId, (error, result) => {
      if (error) {
        return res.status(500).json({ error });
      }
      return res
        .status(200)
        .json({ message: "Collaboration approved", result });
    });
  }
  async rejectCollaboration(req, res) {
    const { trackId, artistId } = req.body;
    ArtistModel.rejectCollaboration(trackId, artistId, (error, result) => {
      if (error) {
        return res.status(500).json({ error });
      }
      return res
        .status(200)
        .json({ message: "Collaboration rejected", result });
    });
  }

  async getOrders(req, res) {
    const artist_id = req.user.id;

    try {
      const result = await ArtistModel.getOrders(artist_id);

      if (!result) {
        return res.status(404).send("No orders found");
      }
      return res.status(200).send(result);
    } catch (error) {
      return res.status(500).send("Error: " + error.message);
    }
  }

  async getAllTracks(req, res) {
    const artist_id = req.params.id;
    try {
      const result = await ArtistModel.getAllTracks(artist_id);
      if (!result) {
        return res.status(404).send("No tracks found");
      }
      return res.status(200).send(result);
    } catch (error) {
      return res.status(500).send("Error: " + error.message);
    }
  }

  async getWeeklyOrders(req, res) {
    const artist_id = req.params.id;
    try {
      const result = await ArtistModel.getWeeklyOrders(artist_id);
      if (!result) {
        return res.status(404).send("No orders found");
      }
      return res.status(200).send(result);
    } catch (error) {
      return res.status(500).send("Error: " + error.message);
    }
  }

  async getWeeklyCustomers(req, res) {
    const artist_id = req.params.id;
    try {
      const result = await ArtistModel.getWeeklyCustomers(artist_id);
      if (!result) {
        return res.status(404).send("No customers found");
      }
      return res.status(200).send(result);
    } catch (error) {
      return res.status(500).send("Error: " + error.message);
    }
  }

  async getWeeklySales(req, res) {
    const artist_id = req.params.id;
    try {
      const result = await ArtistModel.getWeeklySales(artist_id);
      if (!result) {
        return res.status(404).send("No sales found");
      }
      return res.status(200).send(result);
    } catch (error) {
      return res.status(500).send("Error: " + error.message);
    }
  }

  async getWeeklyStreams(req, res) {
    const artist_id = req.params.id;
    try {
      const result = await ArtistModel.getWeeklyStreams(artist_id);
      if (!result) {
        return res.status(404).send("No streams found");
      }
      return res.status(200).send(result);
    } catch (error) {
      return res.status(500).send("Error: " + error.message);
    }
  }

  async getMostPlayedTracks(req, res) {
    const artist_id = req.params.id;
    try {
      const result = await ArtistModel.getMostPlayedTracks(artist_id);
      if (!result) {
        return res.status(404).send("No tracks found");
      }
      return res.status(200).send(result);
    } catch (error) {
      return res.status(500).send("Error: " + error.message);
    }
  }

  async getMerchandiseTypes(req, res) {
    const artist_id = req.params.id;
    try {
      const result = await ArtistModel.getMerchandiseTypes(artist_id);
      if (!result) {
        return res.status(404).send("No merchandise types found");
      }
      return res.status(200).send(result);
    } catch (error) {
      return res.status(500).send("Error: " + error.message);
    }
  }
}
export default new ArtistController();
