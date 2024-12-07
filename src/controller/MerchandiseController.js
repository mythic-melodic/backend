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
    const { sort } = req.query;

    try {
      const result = await MerchandiseModel.getAllMerchandiseByArtist(
        artist_id,
        sort
      );
      if (!result) {
        return res.status(404).send("No merchandise found");
      }
      res.status(200).send(result);
    } catch (error) {
      res.status(500).send("Error: " + error.message);
    }
  }

  async updateMerchandise(req, res) {
    const merchandise_id = req.params.id;
    const artist_id = req.user.id;
    const { name, album_id, stock, price, image, description } = req.body;
    console.log("artist_id", artist_id);

    try {
      const existingMerchandise = await MerchandiseModel.getMerchandiseById(
        merchandise_id
      );
      if (!existingMerchandise) {
        return res.status(404).send("No merchandise found");
      }

      if (existingMerchandise.artist_id !== artist_id) {
        return res.status(403).json({
          message: "Unauthorized to update this merchandise.",
        });
      }

      const updatedMerchandise = await MerchandiseModel.updateMerchandise(
        merchandise_id,
        name,
        album_id,
        stock,
        price,
        image,
        description
      );
      res.status(200).json({
        message: "Merchandise updated successfully",
        updatedMerchandise,
      });
    } catch (error) {
      res.status(500).json({ message: "Error: " + error.message });
    }
  }

  async deleteMerchandise(req, res) {
    const merchandise_id = req.params.id;
    const artist_id = req.user.id;

    try {
      const existingMerchandise = await MerchandiseModel.getMerchandiseById(
        merchandise_id
      );
      if (!existingMerchandise) {
        return res.status(404).send("No merchandise found");
      }

      if (existingMerchandise.artist_id !== artist_id) {
        return res.status(403).json({
          message: "Unauthorized to delete this merchandise.",
        });
      }

      await MerchandiseModel.deleteMerchandise(merchandise_id);
      res.status(200).json({
        message: "Merchandise deleted successfully",
        deleteMerchandise: existingMerchandise,
      });
    } catch (error) {
      res.status(500).json({ message: "Error: " + error.message });
    }
  }
}

export default new MerchandiseController();
