import MerchandiseModel from "../model/merchandise.model.js";
import useGoogleDriveUpload from "../hooks/upload.media.js";

class MerchandiseController {
  async getAllMerchandise(req, res) {
    try {
      const result = await MerchandiseModel.getAllMerchandise();

      if (!result) {
        return res.status(404).send("No merchandise found");
      }
      return res.status(200).send(result);
    } catch (error) {
      return res.status(500).send("Error: " + error.message);
    }
  }

  async createMerchandise(req, res) {
    const { name, album_id, stock, price, description, category } = req.body;
    const artist_id = req.user.id;

    try {
      const image = await useGoogleDriveUpload(req);
      const result = await MerchandiseModel.createMerchandise(
        name,
        artist_id,
        album_id,
        stock,
        price,
        image,
        description,
        category
      );

      return res.status(201).json({
        message: "Merchandise created successfully",
        merchandise_id: result,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error: " + error.message });
    }
  }

  async getMerchandiseById(req, res) {
    const merchandise_id = req.params.id;
    try {
      const result = await MerchandiseModel.getMerchandiseById(merchandise_id);
      if (!result) {
        return res.status(404).send("No merchandise found");
      }
      return res.status(200).send(result);
    } catch (error) {
      return res.status(500).send("Error: " + error.message);
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
      return res.status(200).send(result);
    } catch (error) {
      return res.status(500).send("Error: " + error.message);
    }
  }

  async updateMerchandise(req, res) {
    const merchandise_id = req.params.id;
    const artist_id = req.user.id;
    const { name, album_id, stock, price, description, category } = req.body;

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

      let image = null;
      if (req.file) {
        image = await useGoogleDriveUpload(req, res);
      } else {
        image = existingMerchandise.image;
      }

      const updatedMerchandise = await MerchandiseModel.updateMerchandise(
        merchandise_id,
        { name, albumId: album_id, stock, price, image, description, category }
      );

      return res.status(200).json({
        message: "Merchandise updated successfully",
        updatedMerchandise,
      });
    } catch (error) {
      return res.status(500).json({ message: "Error: " + error.message });
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

      const deletedMerchandise = await MerchandiseModel.deleteMerchandise(
        merchandise_id
      );
      return res.status(200).json({
        message: "Merchandise deleted successfully",
        deleteMerchandise: deletedMerchandise,
      });
    } catch (error) {
      return res.status(500).json({ message: "Error: " + error.message });
    }
  }

  async getTotalSold(req, res) {
    try {
      const merchandiseId = req.params.id;
      const totalSold = await MerchandiseModel.getTotalSold(merchandiseId);
      if (totalSold.message) {
        return res.status(404).json({
          success: false,
          message: totalSold.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Total sold fetched successfully.",
        data: totalSold,
      });
    } catch (error) {
      console.error("Error fetching total sold:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch total sold.",
        error: error.message,
      });
    }
  }

  async getNewArrivals(req, res) {
    try {
      // Gọi hàm từ model để lấy danh sách sản phẩm mới
      const data = await MerchandiseModel.getNewArrivals();

      // Thành công, trả về danh sách
      return res.status(200).json({
        success: true,
        message: "New arrivals fetched successfully.",
        data: data,
      });
    } catch (error) {
      console.error("Error fetching new arrivals:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch new arrivals.",
        error: error.message,
      });
    }
  }

  async getTrendingNow(req, res) {
    try {
      // Gọi hàm từ model để lấy danh sách sản phẩm trending
      const data = await MerchandiseModel.getTrendingNow();

      // Thành công, trả về danh sách
      return res.status(200).json({
        success: true,
        message: "Trending products fetched successfully.",
        data: data,
      });
    } catch (error) {
      console.error("Error fetching trending products:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch trending products.",
        error: error.message,
      });
    }
  }

  async getFavArtistStore(req, res) {
    try {
      const userId = req.params.id;
      const data = await MerchandiseModel.getFavArtistStore(userId);
      if (!data || data.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No merchandise found for the favorite artists.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Favorite artist merchandise fetched successfully.",
        data: data,
      });
    } catch (error) {
      console.error("Error fetching favorite artist merchandise:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch favorite artist merchandise.",
        error: error.message,
      });
    }
  }
  async getMerchandiseDetailById(req, res) {
    try {
      const merchandiseId = req.params.id;
      const data = await MerchandiseModel.getMerchandiseDetailById(
        merchandiseId
      );
      if (!data || data.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Merchandise not found.",
          data: null,
        });
      }
      return res.status(200).json({
        success: true,
        message: "Merchandise details fetched successfully.",
        data: data,
      });
    } catch (error) {
      console.error("Error fetching merchandise details:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch merchandise details.",
        error: error.message,
      });
    }
  }
  async updateStock(req, res) {
    try {
      const merchandise_id = req.params.id;
      const { stock } = req.body;
      if (!merchandise_id || stock === undefined) {
        return res.status(400).json({
          success: false,
          message: "Merchandise ID and stock value are required.",
        });
      }
      const updatedMerchandise = await MerchandiseModel.updateStock(
        merchandise_id,
        stock
      );

      if (!updatedMerchandise) {
        return res.status(404).json({
          success: false,
          message: "Merchandise not found.",
        });
      }
      return res.status(200).json({
        success: true,
        message: "Stock updated successfully.",
        data: updatedMerchandise,
      });
    } catch (error) {
      console.error("Error updating stock:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update stock.",
        error: error.message,
      });
    }
  }
  async getAllMerByArtist(req, res) {
    try {
      const artist_id = req.params.artist_id;
      if (!artist_id) {
        return res.status(400).json({
          success: false,
          message: "Artist ID is required.",
        });
      }
      const merchandiseList = await MerchandiseModel.getAllMerByArtist(
        artist_id
      );

      if (merchandiseList.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No merchandise found for the specified artist.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Merchandise fetched successfully.",
        data: merchandiseList,
      });
    } catch (error) {
      console.error("Error fetching merchandise:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch merchandise.",
        error: error.message,
      });
    }
  }
  async getTopSellingMerchandiseByArtist(req, res) {
    try {
      const artist_id = req.params.artist_id;
      if (!artist_id) {
        return res.status(400).json({
          success: false,
          message: "Artist ID is required.",
        });
      }

      const topSellingMerchandise =
        await MerchandiseModel.getTopSellingMerchandiseByArtist(artist_id);

      if (topSellingMerchandise.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No merchandise found for the specified artist.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Top-selling merchandise fetched successfully.",
        data: topSellingMerchandise,
      });
    } catch (error) {
      console.error("Error fetching top-selling merchandise:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch top-selling merchandise.",
        error: error.message,
      });
    }
  }

  async getMerchandiseBySearch(req, res) {
    try {
      const { searchTerm } = req.query;
      if (!searchTerm) {
        return res.status(400).json({
          success: false,
          message: "Search term is required.",
        });
      }
      const searchResults = await MerchandiseModel.getMerchandiseBySearch(
        searchTerm
      );
      return res.status(200).json({
        success: true,
        message: "Merchandise matching search term fetched successfully.",
        data: searchResults,
      });
    } catch (error) {
      console.error("Error fetching merchandise by search:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch merchandise.",
        error: error.message,
      });
    }
  }
  
  async getMostPopularStore(req, res) {
    try {
      const result = await MerchandiseModel.getMostPopularStore();

      if (!result || result.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No merchandise found for the most popular store.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Most popular store merchandise fetched successfully.",
        data: result,
      });
    } catch (error) {
      console.error("Error fetching most popular store:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch most popular store merchandise.",
        error: error.message,
      });
    }
  }
}

export default new MerchandiseController();
