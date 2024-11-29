import MerchandiseModel from "../model/merchandise.model.js";

class MerchandiseController {
  async getAllMerchandise(req, res) {
    try {
      MerchandiseModel.getAllMerchandise((error, result) => {
        if (error) {
          return res.status(400).send("Error: " + error.message);
        }
        if (!result || !result.rows) {
          return res.status(404).send("No merchandise found");
        }
        res.status(200).send(result.rows);
      });
    } catch (error) {
      res.status(500).send("Error: " + error.message);
    }
  }

  async createMerchandise(req, res) {
    const { name, album_id, stock, price, image, description } = req.body;
    const artist_id = req.user.id;

    console.log("artist_id", artist_id);
    try {
      const result = await MerchandiseModel.createMerchandise(
        name,
        artist_id,
        album_id,
        stock,
        price,
        image,
        description
      );
      res.status(201).json({
        message: "Merchandise created successfully",
        merchandise_id: result.merchandise_id,
      });
    } catch (error) {
      res.status(500).json({ message: "Error: " + error.message });
    }
  }

  async getMerchandiseById(req, res) {
    const merchandise_id = req.params.id;
    try {
      const result = await MerchandiseModel.getMerchandiseById(merchandise_id);
      if (!result) {
        return res.status(404).send("No merchandise found");
      }
      res.status(200).send(result);
    } catch (error) {
      res.status(500).send("Error: " + error.message);
    }
  }

  async getAllMerchandiseByArtist(req, res) {
    const artist_id = req.params.id;

    try {
      MerchandiseModel.getAllMerchandiseByArtist(artist_id, (error, result) => {
        if (error) {
          res.status(400).send("Error: " + error.message);
        }
        res.status(200).send(result.rows);
      });
    } catch (error) {
      res.status(500).send("Error: " + error.message);
    }
  }

  async updateMerchandise(req, res) {
    const merchandise_id = req.params.id;
    const artist_id = req.user.id;
    const { name, album_id, stock, price, image, description } = req.body;

    try {
      MerchandiseModel.getMerchandiseById(merchandise_id, (error, result) => {
        if (error) {
          res.status(400).send("Error: " + error.message);
        }

        if (result[0].artist_id !== artist_id) {
          return res.status(403).json({
            message: "You do not have permission to update this merchandise.",
          });
        }
      });

      MerchandiseModel.updateMerchandise(
        merchandise_id,
        name,
        artist_id,
        album_id,
        stock,
        price,
        image,
        description,
        (error, result) => {
          if (error) {
            res.status(400).send("Error: " + error.message);
          }
          res.status(200).send(result);
        }
      );
    } catch (error) {
      res.status(500).send("Error: " + error.message);
    }
  }

  async deleteMerchandise(req, res) {
    const merchandise_id = req.params.id;

    try {
      MerchandiseModel.deleteMerchandise(merchandise_id, (error, result) => {
        if (error) {
          res.status(400).send("Error: " + error.message);
        }

        if (result[0].artist_id !== req.user.id) {
          return res.status(403).json({
            message: "You do not have permission to delete this merchandise.",
          });
        }
        res
          .status(200)
          .send({ success: true, message: "Merchandise deleted." });
      });
    } catch (error) {
      res.status(500).send("Error: " + error.message);
    }
  }
}

export default new MerchandiseController();
