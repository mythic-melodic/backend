import pool from "../config/db.connect.js";

const MerchandiseModel = {
  createMerchandise: async (
    name,
    artistId,
    albumId,
    stock,
    price,
    image,
    description
  ) => {
    try {
      const query = `
      INSERT INTO merchandise (name, artist_id, album_id, stock, price, image, description, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP) RETURNING id;
    `;

      const result = await pool.query(query, [
        name,
        artistId,
        albumId,
        stock,
        price,
        image,
        description,
      ]);

      return { merchandise_id: result.rows[0].id };
    } catch (error) {
      throw new Error("Failed to create merchandise: " + error.message);
    }
  },

  getAllMerchandise: async () => {
    try {
      const query = `SELECT * FROM merchandise`;
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error("Failed to get all merchandise: " + error.message);
    }
  },

  getMerchandiseById: async (merchandiseId) => {
    try {
      const query = `SELECT * FROM merchandise WHERE id = $1`;
      const result = await pool.query(query, [merchandiseId]);
      if (result.rows.length === 0) {
        return null;
      }
      return result.rows[0];
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  },

  getAllMerchandiseByArtist: async (artistId, sort) => {
    let orderByClause;
    switch (sort) {
      case "newest":
        orderByClause = "ORDER BY created_at DESC";
        break;
      case "oldest":
        orderByClause = "ORDER BY created_at ASC";
        break;
      case "popularityAscending":
        orderByClause = "ORDER BY total_sold ASC";
        break;
      case "popularityDescending":
        orderByClause = "ORDER BY total_sold DESC";
        break;
      case "priceAscending":
        orderByClause = "ORDER BY price ASC";
        break;
      case "priceDescending":
        orderByClause = "ORDER BY price DESC";
        break;
      case "stockAscending":
        orderByClause = "ORDER BY stock ASC";
        break;
      case "stockDescending":
        orderByClause = "ORDER BY stock DESC";
        break;

      default:
        orderByClause = "ORDER BY created_at DESC";
    }

    try {
      const query = `
        SELECT m.id, m.name as name, m.price as price, m.image as image, m.stock as stock, COALESCE(SUM(om.quantity), 0) as total_sold
        FROM merchandise m
        LEFT JOIN order_merchandise om ON m.id = om.merchandise_id
        WHERE m.artist_id = $1
        GROUP BY m.id
        ${orderByClause};
      `;
      const result = await pool.query(query, [artistId]);
      return result.rows;
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  },

  updateMerchandise: async (
    merchandiseId,
    name,
    albumId,
    stock,
    price,
    image,
    description
  ) => {
    try {
      const query = `UPDATE merchandise SET name = $1, album_id = $2, stock = $3, price = $4, image = $5, description = $6 WHERE id = $7 RETURNING *;
`;
      const result = await pool.query(query, [
        name,
        albumId,
        stock,
        price,
        image,
        description,
        merchandiseId,
      ]);
      if (result.rows.length === 0) {
        throw new Error("Failed to update merchandise, no such record found.");
      }
      return result.rows[0];
    } catch (error) {
      throw new Error("Failed to update merchandise: " + error.message);
    }
  },

  deleteMerchandise: async (merchandiseId) => {
    try {
      const query = `DELETE FROM merchandise WHERE id = $1 RETURNING id`;
      const result = await pool.query(query, [merchandiseId]);

      if (result.rows.length === 0) {
        throw new Error("Failed to delete merchandise, no such record found.");
      }

      return result.rows[0];
    } catch (error) {
      throw new Error("Failed to delete merchandise: " + error.message);
    }
  },
  getNewArrivals: async () => {
    try {
      const query = `
            SELECT * FROM merchandise WHERE created_at >= NOW() - INTERVAL '7 DAYS'`;
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(
        "Failer to get new arrival merchandises: " + error.message
      );
    }
  },
};

export default MerchandiseModel;
