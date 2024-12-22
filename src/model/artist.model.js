import pool from "../config/db.connect.js";
import createId from "../hooks/idGenerator.js";

const ArtistModel = {
  create: async (artist_name, artist_bio, artist_img, callback) => {
    const query = `INSERT INTO artists (artist_name, artist_bio, artist_img) VALUES (?, ?, ?)`;
    try {
      const [result] = await pool.query(query, [
        artist_name,
        artist_bio,
        artist_img,
      ]);
      callback(null, result.insertId);
    } catch (error) {
      return callback(error);
    }
  },
  getAll: async (callback) => {
    const query = `SELECT * FROM users WHERE user_role = ?`;
    try {
      const [result] = await pool.query(query, ["artist"]);
      callback(null, result);
    } catch (error) {
      return callback(error);
    }
  },
  getById: async (id, callback) => {
    const query = `SELECT * FROM users WHERE id = ? and user_role = ?`;
    try {
      const [result] = await pool.query(query, [id, "artist"]);
      callback(null, result);
    } catch (error) {
      return callback(error);
    }
  },
  getTopTracks: async (artistId, callback) => {
    try {
      const query = `SELECT tracks.id AS track_id, tracks.title AS title, tracks.track_url, albums.cover as cover, COUNT(plays.track_id) AS play_count 
                        FROM plays_user_track AS plays
                        INNER JOIN tracks ON tracks.id = plays.track_id
                        INNER JOIN user_track AS uploads ON uploads.track_id = tracks.id
                        INNER JOIN users ON users.id = uploads.user_id
                        INNER JOIN track_album ON track_album.track_id = tracks.id
                        INNER JOIN albums ON albums.id = track_album.album_id
                        WHERE users.id = ? 
                        GROUP BY tracks.id, albums.id
                        ORDER BY play_count DESC`;
      const [trackResult] = await pool.query(query, [artistId]);

      if (trackResult.length === 0) {
        return callback({ message: "No tracks found" });
      }

      const artistQuery = `SELECT users.display_name, users.username, users.id FROM user_track
            INNER JOIN users ON user_track.user_id = users.id 
            WHERE user_track.track_id = ?`;

      const results = await Promise.all(
        trackResult.map(async (track) => {
          const [artistResult] = await pool.query(artistQuery, [track.track_id]);
          return {
            id: track.track_id,
            title: track.title,
            track_url: track.track_url,
            cover: track.cover,
            artists: artistResult.map((row) => ({
              id: row.id,
              display_name: row.display_name,
              username: row.username,
            })), // Assuming multiple artists
          };
        })
      );

      callback(null, results);
    } catch (error) {
      callback(error);
    }
  },
  getLastestTracks: async (artistId, callback) => {
    const query = `SELECT tracks.id as id, tracks.title as title, tracks.release_date, track_url,
                        artist_role, albums.cover as cover
                        FROM tracks
                        INNER JOIN track_album ON tracks.id = track_album.track_id
                        INNER JOIN albums ON track_album.album_id = albums.id
                        INNER JOIN user_track ON tracks.id = user_track.track_id
                        WHERE user_track.user_id = ? AND tracks.status = 'public' ORDER BY tracks.release_date DESC LIMIT 1`;
    try {
      const [trackResult] = await pool.query(query, [artistId]);
      const artistQuery = `SELECT users.display_name FROM user_track
            INNER JOIN users ON user_track.user_id = users.id 
            WHERE user_track.track_id = ?`;
      const [artistResult] = await pool.query(artistQuery, [
        trackResult[0].id,
      ]);
      const result = {
        id: trackResult[0]?.id,
        title: trackResult[0]?.title,
        track_url: trackResult[0]?.track_url,
        cover: trackResult[0]?.cover,
        release_date: trackResult[0]?.release_date,
        artists: artistResult.map((row) => row.display_name), // Assuming multiple artists
      };
      callback(null, result);
    } catch (error) {
      return callback(error);
    }
  },
  addAlbum: async (album, cover, callback) => {
    const { title, release_date, description, album_type, artist_id } = album;
    const formattedReleaseDate = new Date(release_date).toISOString().slice(0, 19).replace("T", " ");
    try {
      const checkArtist = `SELECT * FROM users WHERE id = ? AND user_role = 'artist'`;
      const [artist] = await pool.query(checkArtist, [artist_id]);
      if (artist.length === 0) {
        return callback({ message: "Artist not found" });
      }
      const checkAlbum = `SELECT * FROM albums WHERE title = ? AND artist_id = ?`;
      const [albumExists] = await pool.query(checkAlbum, [title, artist_id]);
      if (albumExists.length > 0) {
        return callback({ message: "Album already exists" });
      }
      const id = createId();
      const query = `INSERT INTO albums (id, title, release_date, description, cover, album_type, artist_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;

      const [result] = await pool.query(query, [
        id,
        title,
        formattedReleaseDate,
        description,
        cover,
        album_type,
        artist_id,
      ]);
      callback(null, result.insertId);
    } catch (error) {
      return callback(error);
    }
  },
  getAlbums: async (artistId, callback) => {
    const query = `SELECT * FROM albums WHERE artist_id = ? AND album_type ='album'`;
    try {
      const [result] = await pool.query(query, [artistId]);
      callback(null, result);
    } catch (error) {
      return callback(error);
    }
  },
  getAllTracksPending: async (id, callback) => {
    try {
      const query = `SELECT 
                                tracks.id AS track_id, 
                                tracks.title, 
                                albums.cover, 
                                t2.status, 
                                users.display_name AS collaborator_name, 
                                original_users.display_name AS original_artist_name,
                                t2.artist_role AS collaborator_role,
                                t2.profit_share as contribution
                            FROM tracks
                            INNER JOIN track_album AS t1 ON tracks.id = t1.track_id
                            LEFT JOIN albums ON albums.id = t1.album_id
                            INNER JOIN user_track AS t2 ON tracks.id = t2.track_id
                            JOIN users ON t2.user_id = users.id
                            LEFT JOIN user_track AS original_artist ON original_artist.track_id = tracks.id AND original_artist.artist_role = 'original artist'
                            LEFT JOIN users AS original_users ON original_artist.user_id = original_users.id
                            WHERE t2.artist_role = 'collaborator' AND users.id = ?`;
      const [result] = await pool.query(query, [id]);
      return callback(null, result);
    } catch (error) {
      return callback(error);
    }
  },
  approveCollaboration: async (trackId, artistId, callback) => {
    const query = `UPDATE user_track SET status = 'approved' WHERE track_id = ? AND user_id = ? AND artist_role = 'collaborator'`;
    try {
      const [result] = await pool.query(query, [trackId, artistId]);
      callback(null, result);
    } catch (error) {
      return callback(error);
    }
  },
  rejectCollaboration: async (trackId, artistId, callback) => {
    const query = `UPDATE user_track SET status = 'rejected' WHERE track_id = ? AND user_id = ? AND artist_role = 'collaborator'`;
    try {
      const [result] = await pool.query(query, [trackId, artistId]);
      callback(null, result);
    } catch (error) {
      return callback(error);
    }
  },
   getOrders: async (artistId) => {
    try {
      const query = `
                SELECT o.* FROM orders o 
                INNER JOIN order_merchandise om ON o.id = om.order_id 
                INNER JOIN merchandise m ON om.merchandise_id = m.id 
                WHERE artist_id = ?;
                `;
      const [result] = await pool.query(query, [artistId]);
      return result;
    } catch (error) {
      throw new Error("Failed to get all orders by artist: " + error.message);
    }
  },
  getAllTracks: async (artistId) => {
    try {
      const query = `select t.id as track_id, 
      t.title as track_title, a.title as album_title
      from tracks t
      inner join user_track ut ON ut.track_id = t.id
      inner join track_album ta on ta.track_id = t.id
      inner join albums a on a.id = ta.album_id 
      where ut.user_id = ? and ut.status = 'approved'`;
      const [result] = await pool.query(query, [artistId]);
      return result;
    } catch (error) {
      throw new Error("Failed to get all tracks by artist: " + error.message);
    }
  },
  getWeeklyOrders: async (artistId) => {
    try {
      const query = `
        WITH RECURSIVE date_range AS (
          SELECT DATE(NOW()) AS order_date
          UNION ALL
          SELECT DATE(order_date - INTERVAL 1 DAY)
          FROM date_range
          WHERE order_date > DATE(NOW()) - INTERVAL 6 DAY
        )
        SELECT 
            dr.order_date,
            COALESCE((
                SELECT COUNT(o.id)
                FROM orders o
                LEFT JOIN order_merchandise om ON om.order_id = o.id
                LEFT JOIN merchandise m ON m.id = om.merchandise_id
                WHERE dr.order_date = DATE(o.order_date)
                AND m.artist_id = ?
            ), 0) AS order_count
        FROM date_range dr
        ORDER BY dr.order_date;
      `;
      const [result] = await pool.query(query, [artistId]);

      if (result.length === 0) {
        return null;
      }
      return result;
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  },

  getWeeklyCustomers: async (artistId) => {
    try {
      const query = `
        WITH RECURSIVE date_range AS (
          SELECT DATE(NOW()) AS order_date
          UNION ALL
          SELECT DATE(order_date - INTERVAL 1 DAY)
          FROM date_range
          WHERE order_date > DATE(NOW()) - INTERVAL 6 DAY
        )
        SELECT 
            dr.order_date,
            COALESCE((
                SELECT COUNT(DISTINCT o.user_id)  -- Counting distinct customers
                FROM orders o
                LEFT JOIN order_merchandise om ON om.order_id = o.id
                LEFT JOIN merchandise m ON m.id = om.merchandise_id
                WHERE dr.order_date = DATE(o.order_date)
                AND m.artist_id = ?
            ), 0) AS customer_count 
        FROM date_range dr
        ORDER BY dr.order_date;
      `;
      const [result] = await pool.query(query, [artistId]);

      if (result.length === 0) {
        return null;
      }
      return result;
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  },

  getWeeklySales: async (artistId) => {
    const query = `
      WITH RECURSIVE date_range AS (
        SELECT DATE(NOW()) AS order_date
        UNION ALL
        SELECT DATE(order_date - INTERVAL 1 DAY)
        FROM date_range
        WHERE order_date > DATE(NOW()) - INTERVAL 6 DAY
      )
      SELECT 
        dr.order_date,
        COALESCE((
          SELECT SUM(om.quantity * om.price_each) 
          FROM orders o
          LEFT JOIN order_merchandise om ON om.order_id = o.id
          LEFT JOIN merchandise m ON m.id = om.merchandise_id
          WHERE dr.order_date = DATE(o.order_date)
          AND m.artist_id = ?
        ), 0) AS sales
      FROM date_range dr
      ORDER BY dr.order_date;
    `;
    try {
      const [result] = await pool.query(query, [artistId]);
      return result;
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  },

  getWeeklyStreams: async (artistId) => {
    try {
      const query = `
        WITH RECURSIVE date_range AS (
          SELECT DATE(NOW()) AS played_date
          UNION ALL
          SELECT DATE(played_date - INTERVAL 1 DAY)
          FROM date_range
          WHERE played_date > DATE(NOW()) - INTERVAL 6 DAY
        )
        SELECT 
          dr.played_date,
          COALESCE((
            SELECT COUNT(put.track_id)
            FROM plays_user_track put
            LEFT JOIN user_track ut ON ut.track_id = put.track_id
            WHERE dr.played_date = DATE(put.played_at)
            AND ut.user_id = ?
          ), 0) AS play_count
        FROM date_range dr
        ORDER BY dr.played_date;
      `;
      const [result] = await pool.query(query, [artistId]);
      return result;
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  },

  getMostPlayedTracks: async (artistId) => {
    try {
      const query = `
        SELECT t.id, t.title, COUNT(p.track_id) AS play_count
        FROM tracks t
        JOIN user_track ut ON t.id = ut.track_id
        LEFT JOIN plays_user_track p ON t.id = p.track_id
        WHERE ut.user_id = ? AND ut.artist_role = 'original artist'
        GROUP BY t.id, t.title
        ORDER BY play_count DESC
        LIMIT 10;
      `;
      const [result] = await pool.query(query, [artistId]);
      return result;
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  },

  getMerchandiseTypes: async (artistId) => {
    try {
      const query = `
        SELECT category, COUNT(*) as count
        FROM merchandise
        WHERE artist_id = ?
        GROUP BY category
      `;
      const [result] = await pool.query(query, [artistId]);
      return result;
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  },
};

export default ArtistModel;