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
      const [result] = await pool.query(query);
      return result;
    } catch (error) {
      throw new Error("Failed to get all merchandise: " + error.message);
    }
  },

  getMerchandiseById: async (merchandiseId) => {
    try {
      const query = `SELECT * FROM merchandise WHERE id = ?`;
      const [result] = await pool.query(query, [merchandiseId]);
      if (result.length === 0) {
        return null;
      }
      return result[0];
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
        WHERE m.artist_id = ?
        GROUP BY m.id
        ${orderByClause};
      `;
      const [result] = await pool.query(query, [artistId]);
      return result;
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  },

  updateMerchandise: async (
    merchandiseId,
    { name, albumId, stock, price, image, description, category }
  ) => {
    try {
      const setClauses = [];
      const values = [];
      let index = 1;
  
      if (name !== undefined) {
        setClauses.push(`name = ?`);
        values.push(name);
        index++;
      }
      if (albumId !== undefined) {
        setClauses.push(`album_id = ?`);
        values.push(albumId);
        index++;
      }
      if (stock !== undefined) {
        setClauses.push(`stock = ?`);
        values.push(stock);
        index++;
      }
      if (price !== undefined) {
        setClauses.push(`price = ?`);
        values.push(price);
        index++;
      }
      if (image !== undefined) {
        setClauses.push(`image = ?`);
        values.push(image);
        index++;
      }
      if (description !== undefined) {
        setClauses.push(`description = ?`);
        values.push(description);
        index++;
      }
      if (category !== undefined) {
        setClauses.push(`category = ?`);
        values.push(category);
        index++;
      }
  
      if (setClauses.length === 0) {
        throw new Error("No valid fields to update");
      }
  
      // Add the WHERE clause and return the updated row
      const query = `
        UPDATE merchandise
        SET ${setClauses.join(', ')}
        WHERE id = ?
        RETURNING *;
      `;
      values.push(merchandiseId);
  
      const [result] = await pool.query(query, values);
  
      if (result.length === 0) {
        throw new Error("Failed to update merchandise, no such record found.");
      }
      return result[0];
    } catch (error) {
      throw new Error("Failed to update merchandise: " + error.message);
    }
  },

  deleteMerchandise: async (merchandiseId) => {
    try {
      const query = `DELETE FROM merchandise WHERE id = ? RETURNING id`;
      const [result] = await pool.query(query, [merchandiseId]);

      if (result.length === 0) {
        throw new Error("Failed to delete merchandise, no such record found.");
      }

      return result[0];
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
                MONTH(o.order_date) = MONTH(CURRENT_DATE)
                AND YEAR(o.order_date) = YEAR(CURRENT_DATE)
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
      const updateQuery = `UPDATE merchandise SET stock = ? WHERE id = ? RETURNING *`;
      const [updateResult] = await pool.query(updateQuery, [
        newStock,
        merchandiseId,
      ]);
      return updateResult[0];
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
          m.name LIKE ? 
          OR CAST(m.category AS CHAR) LIKE ?
          OR u.display_name LIKE ?
          OR a.title LIKE ?
          OR LOWER(m.name) LIKE LOWER(?)
          OR LOWER(CAST(m.category AS CHAR)) LIKE LOWER(?)
          OR LOWER(u.display_name) LIKE LOWER(?)
          OR LOWER(a.title) LIKE LOWER(?)
        ;
      `;
      // Use the search term with wildcards for partial matching
      const [result] = await pool.query(query, [
        `%${searchTerm.toLowerCase()}%`,
        `%${searchTerm.toLowerCase()}%`,
        `%${searchTerm.toLowerCase()}%`,
        `%${searchTerm.toLowerCase()}%`,
        `%${searchTerm.toLowerCase()}%`,
        `%${searchTerm.toLowerCase()}%`,
        `%${searchTerm.toLowerCase()}%`,
        `%${searchTerm.toLowerCase()}%`,
      ]);

      return result || [];
    } catch (error) {
      console.error("Error fetching merchandise by search:", error);
      throw new Error("Failed to fetch merchandise: " + error.message);
    }
  },
};

export default MerchandiseModel;