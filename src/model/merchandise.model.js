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

  getAllMerchandise: async (callback) => {
    try {
      const query = `SELECT * FROM merchandise`;
      const result = await pool.query(query);
      return callback(null, result);
    } catch (error) {
      return callback(error);
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

  getAllMerchandiseByArtist: async (artistId, callback) => {
    try {
      const query = `SELECT * FROM merchandise WHERE artist_id = $1`;
      const result = await pool.query(query, [artistId]);
      return callback(null, result);
    } catch (error) {
      return callback(error);
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
};

export default MerchandiseModel;
