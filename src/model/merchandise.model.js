import pool from "../config/db.connect.js";

const MerchandiseModel = {
  createMerchandise: async (
    name,
    artistId,
    albumId,
    stock,
    price,
    image,
    description,
    category
  ) => {
    try {
      const query = `
        INSERT INTO merchandise (name, artist_id, album_id, stock, price, image, description, category, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);
      `;
      const [result] = await pool.query(query, [
        name,
        artistId,
        albumId,
        stock,
        price,
        image,
        description,
        category,
      ]);
      return result.insertId;
    } catch (error) {
      throw new Error("Failed to create merchandise: " + error.message);
    }
  },

  getAllMerchandise: async () => {
    try {
      const query = `SELECT * FROM merchandise`;
      const [rows] = await pool.query(query);
      return rows;
    } catch (error) {
      throw new Error("Failed to get all merchandise: " + error.message);
    }
  },

  getMerchandiseById: async (merchandiseId) => {
    try {
      const query = `SELECT * FROM merchandise WHERE id = ?`;
      const [rows] = await pool.query(query, [merchandiseId]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error("Failed to get merchandise by ID: " + error.message);
    }
  },

  getAllMerchandiseByArtist: async (artistId, sort) => {
    const sortOptions = {
      newest: "created_at DESC",
      oldest: "created_at ASC",
      popularityAscending: "total_sold ASC",
      popularityDescending: "total_sold DESC",
      priceAscending: "price ASC",
      priceDescending: "price DESC",
      stockAscending: "stock ASC",
      stockDescending: "stock DESC",
    };
    const orderByClause = sortOptions[sort] || "created_at DESC";

    try {
      const query = `
        SELECT m.id, m.name, m.price, m.image, m.stock, COALESCE(SUM(om.quantity), 0) AS total_sold
        FROM merchandise m
        LEFT JOIN order_merchandise om ON m.id = om.merchandise_id
        WHERE m.artist_id = ?
        GROUP BY m.id
        ORDER BY ${orderByClause};
      `;
      const [rows] = await pool.query(query, [artistId]);
      return rows;
    } catch (error) {
      throw new Error("Failed to get merchandise by artist: " + error.message);
    }
  },

  updateMerchandise: async (
    merchandiseId,
    { name, albumId, stock, price, image, description, category }
  ) => {
    try {
      const fields = [];
      const values = [];
      if (name) fields.push("name = ?"), values.push(name);
      if (albumId) fields.push("album_id = ?"), values.push(albumId);
      if (stock) fields.push("stock = ?"), values.push(stock);
      if (price) fields.push("price = ?"), values.push(price);
      if (image) fields.push("image = ?"), values.push(image);
      if (description) fields.push("description = ?"), values.push(description);
      if (category) fields.push("category = ?"), values.push(category);

      if (!fields.length) throw new Error("No fields to update");

      const query = `UPDATE merchandise SET ${fields.join(", ")} WHERE id = ?`;
      values.push(merchandiseId);

      const [result] = await pool.query(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error("Failed to update merchandise: " + error.message);
    }
  },

  deleteMerchandise: async (merchandiseId) => {
    try {
      const query = `DELETE FROM merchandise WHERE id = ?`;
      const [result] = await pool.query(query, [merchandiseId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error("Failed to delete merchandise: " + error.message);
    }
  },

  getTotalSold: async (merchandiseId) => {
    try {
      const query = `
        SELECT COALESCE(SUM(quantity), 0) AS total_quantity
        FROM order_merchandise
        WHERE merchandise_id = ?`;
      const [result] = await pool.query(query, [merchandiseId]);
      if (!result || result.length === 0) {
        return { message: "No data found" };
      }

      return result[0].total_quantity;
    } catch (error) {
      throw new Error("Failed to get total sold: " + error.message);
    }
  },

  getNewArrivals: async () => {
    try {
      const query = `
            SELECT * FROM merchandise WHERE created_at >= NOW() - INTERVAL 14 DAY`;
      const [result] = await pool.query(query);
      if (!result || result.length === 0) {
        return { message: "No new arrivals found" };
      }

      return result;
    } catch (error) {
      console.log(error);
      throw new Error(
        "Failed to get new arrival merchandise: " + error.message
      );
    }
  },

  getTrendingNow: async () => {
    try {
      const query = `
            SELECT 
                m.id,
                m.name,
                m.description,
                m.price,
                m.image,
                SUM(om.quantity) AS total_quantity
            FROM 
                order_merchandise om
            JOIN 
                merchandise m ON om.merchandise_id = m.id
            JOIN 
                orders o ON om.order_id = o.id
            WHERE 
                EXTRACT(MONTH FROM o.order_date) = EXTRACT(MONTH FROM CURRENT_DATE)
                AND EXTRACT(YEAR FROM o.order_date) = EXTRACT(YEAR FROM CURRENT_DATE)
            GROUP BY 
                m.id, m.name, m.description, m.price, m.image
            ORDER BY 
                total_quantity DESC
            LIMIT 10;
        `;
      const [result] = await pool.query(query);
      if (!result || result.length === 0) {
        return { message: "No merchandise found" };
      }
      return result;
    } catch (error) {
      throw new Error("Failed to get trending merchandise: " + error.message);
    }
  },

  getFavArtistStore: async (userId) => {
    try {
      const query = `
        SELECT 
            half.artist_id, 
            users.display_name, 
            half.id, 
            half.name, 
            half.price, 
            half.image 
        FROM
            (
                SELECT 
                    m.artist_id,
                    m.id,
                    m.name,
                    m.price,
                    m.image
                FROM 
                    merchandise AS m
                JOIN 
                    (
                        SELECT 
                            ut.user_id AS artist_id,
                            SUM(put.play_duration) AS total_play_duration
                        FROM 
                            plays_user_track put
                        JOIN 
                            user_track ut ON put.track_id = ut.track_id
                        WHERE 
                            ut.artist_role = 'original artist'
                            AND put.user_id = ?
                        GROUP BY 
                            ut.user_id
                        ORDER BY 
                            total_play_duration DESC
                        LIMIT 1
                    ) AS a ON m.artist_id = a.artist_id
            ) AS half
        JOIN 
            users ON half.artist_id = users.id
        ORDER BY RAND();
        `;
      const [result] = await pool.query(query, [userId]);
      if (!result || result.length === 0) {
        return { message: "no merchandise found" };
      }
      return result;
    } catch (error) {
      throw new Error(
        "Failed to get favorite artist store merchandise: " + error.message
      );
    }
  },

  getMerchandiseDetailById: async (merchandiseId) => {
    try {
      const query = `SELECT 
              m.*, 
              u.display_name AS artist_name, 
              u.avatar AS artist_avatar, 
              a.cover AS album_cover
          FROM 
              (SELECT * FROM merchandise WHERE id = ?) AS m 
          LEFT JOIN users AS u ON m.artist_id = u.id
          LEFT JOIN albums AS a ON m.album_id = a.id`;
      const [result] = await pool.query(query, [merchandiseId]);
      if (result.length === 0) {
        return null;
      }
      return result[0];
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  },
  updateStock: async (merchandiseId, quantityToReduce) => {
    try {
      const query = `SELECT stock FROM merchandise WHERE id = ?`;
      const [result] = await pool.query(query, [merchandiseId]);

      if (result.length === 0) {
        throw new Error("Merchandise not found");
      }
      const currentStock = result[0].stock;
      const newStock = currentStock - quantityToReduce;
      if (newStock < 0) {
        throw new Error("Stock cannot be negative");
      }
      const updateQuery = `UPDATE merchandise SET stock = ? WHERE id = ?`;
      await pool.query(updateQuery, [newStock, merchandiseId]);

      const selectQuery = `SELECT * FROM merchandise WHERE id = ?`;
      const [updatedRows] = await pool.query(selectQuery, [merchandiseId]);
      return updatedRows.length > 0 ? updatedRows[0] : null;
    } catch (error) {
      console.error("Error updating stock:", error);
      throw new Error("Failed to update stock: " + error.message);
    }
  },
  getAllMerByArtist: async (artistId) => {
    try {
      const query = `
        SELECT * 
        FROM merchandise
        WHERE artist_id = ?
      `;
      const [result] = await pool.query(query, [artistId]);
      if (result.length === 0) {
        throw new Error("No merchandise found for the specified artist");
      }

      return result;
    } catch (error) {
      console.error("Error fetching merchandise:", error);
      throw new Error("Failed to fetch merchandise: " + error.message);
    }
  },
  async getTopSellingMerchandiseByArtist(artistId) {
    try {
      const query = `
        SELECT 
          m.id, 
          m.name as name, 
          m.price as price, 
          m.image as image, 
          m.stock as stock, 
          COALESCE(SUM(om.quantity), 0) as total_sold
        FROM merchandise m
        LEFT JOIN order_merchandise om ON m.id = om.merchandise_id
        WHERE m.artist_id = ?
        GROUP BY m.id
        ORDER BY total_sold DESC
        LIMIT 20
      `;

      const [result] = await pool.query(query, [artistId]);
      if (result.length === 0) {
        throw new Error(
          "No top-selling merchandise found for the specified artist"
        );
      }

      return result;
    } catch (error) {
      console.error("Error fetching top-selling merchandise:", error);
      throw new Error(
        "Failed to fetch top-selling merchandise: " + error.message
      );
    }
  },

  async getMerchandiseBySearch(searchTerm) {
    try {
      const query = `
        SELECT m.*, a.title, a.description, u.display_name
        FROM merchandise AS m
        JOIN albums AS a ON m.album_id = a.id
        JOIN users AS u ON m.artist_id = u.id
        WHERE 
          LOWER(m.name) LIKE LOWER(CONCAT('%', ?, '%'))
          OR LOWER(CAST(m.category AS CHAR)) LIKE LOWER(CONCAT('%', ?, '%'))
          OR LOWER(u.display_name) LIKE LOWER(CONCAT('%', ?, '%'))
          OR LOWER(a.title) LIKE LOWER(CONCAT('%', ?, '%'));
      `;

      // Execute the query with the search term used for all placeholders
      const [result] = await pool.query(query, [
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
      ]);

      return result || [];
    } catch (error) {
      console.error("Error fetching merchandise by search:", error);
      throw new Error("Failed to fetch merchandise: " + error.message);
    }
  },
  getMostPopularStore: async () => {
    try {
      const query = `
                select * from merchandise as m join (SELECT display_name, id
        FROM users 
        WHERE id = (
            SELECT 
                m.artist_id
            FROM 
                order_merchandise AS om
            JOIN 
                merchandise AS m 
                ON om.merchandise_id = m.id
            GROUP BY 
                m.artist_id
            ORDER BY 
                SUM(om.quantity) DESC
            LIMIT 1
        )) as a on m.artist_id = a.id
        `;
      const [result] = await pool.query(query);
      if (!result || result.length === 0) {
        return { message: "no merchandise found" };
      }
      return result;
    } catch (error) {
      throw new Error(
        "Failed to get favorite artist store merchandise: " + error.message
      );
    }
  },
};

export default MerchandiseModel;
