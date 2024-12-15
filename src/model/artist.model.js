import pool from "../config/db.connect.js";
import createId from "../hooks/idGenerator.js";
const ArtistModel = {
  create: async (artist_name, artist_bio, artist_img, callback) => {
    const query = `INSERT INTO artists (artist_name, artist_bio, artist_img) VALUES ($1, $2, $3) RETURNING *`;
    try {
      const result = await pool.query(query, [
        artist_name,
        artist_bio,
        artist_img,
      ]);
      callback(null, result.rows[0]);
    } catch (error) {
      return callback(error);
    }
  },
  getAll: async (callback) => {
    const query = `SELECT * FROM users WHERE user_role = $1`;
    try {
      const result = await pool.query(query, ["artist"]);
      callback(null, result);
    } catch (error) {
      return callback(error);
    }
  },
  getById: async (id, callback) => {
    const query = `SELECT * FROM users WHERE id = $1 and user_role = $2`;
    try {
      const result = await pool.query(query, [id, "artist"]);
      callback(null, result);
    } catch (error) {
      return callback(error);
    }
  },
  getTopTracks: async (artistId, callback) => {
    const query = `SELECT tracks.id AS track_id, tracks.title AS title, COUNT(plays.track_id) AS play_count 
        FROM plays_user_track AS plays
        INNER JOIN tracks ON tracks.id = plays.track_id
        INNER JOIN uploads_user_track AS uploads ON uploads.track_id = tracks.id
        INNER JOIN users ON users.id = uploads.user_id
        WHERE users.id = $1
        GROUP BY tracks.id
        ORDER BY play_count DESC`;
    try {
      const result = await pool.query(query, [artistId]);
      callback(null, result);
    } catch (error) {
      callback(error);
    }
  },
  addAlbum: async (album, cover, callback) => {
    const { title, release_date, description, album_type, artist_id } = album;
    try {
      const checkArtist = `SELECT * FROM users WHERE id = $1 and user_role = 'artist'`;
      const artist = await pool.query(checkArtist, [artist_id]);
      if (artist.rowCount === 0) {
        return callback({ message: "Artist not found" });
      }
      const checkAlbum = `SELECT * FROM albums WHERE title = $1 and artist_id = $2`;
      const albumExists = await pool.query(checkAlbum, [title, artist_id]);
      if (albumExists.rowCount > 0) {
        return callback({ message: "Album already exists" });
      }
      const id = createId();
      const query = `INSERT INTO albums (id, title, release_date, description, cover, album_type, artist_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;

      const result = await pool.query(query, [
        id,
        title,
        release_date,
        description,
        cover,
        album_type,
        artist_id,
      ]);
      callback(null, result.rows[0]);
    } catch (error) {
      return callback(error);
    }
  },
  getAlbums: async (artistId, callback) => {
    const query = `SELECT * FROM albums WHERE artist_id = $1 AND album_type ='album'`;
    try {
      const result = await pool.query(query, [artistId]);
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
                                t2.artist_role AS collaborator_role
                            FROM tracks
                            INNER JOIN track_album AS t1 ON tracks.id = t1.track_id
                            LEFT JOIN albums ON albums.id = t1.album_id
                            INNER JOIN user_track AS t2 ON tracks.id = t2.track_id
                            JOIN users ON t2.user_id = users.id
                            LEFT JOIN user_track AS original_artist ON original_artist.track_id = tracks.id AND original_artist.artist_role = 'original artist'
                            LEFT JOIN users AS original_users ON original_artist.user_id = original_users.id
                            WHERE t2.status = 'pending' AND t2.artist_role = 'collaborator' and users.id = $1 ;`;
      const result = await pool.query(query, [id]);
      return callback(null, result.rows);
    } catch (error) {
      return callback(error);
    }
  },
  approveCollaboration: async (trackId, artistId, callback) => {
    const query = `UPDATE user_track SET status = 'approved' WHERE track_id = $1 AND user_id = $2 AND artist_role = 'collaborator'`;
    try {
      const result = await pool.query(query, [trackId, artistId]);
      callback(null, result);
    } catch (error) {
      return callback(error);
    }
  },
  rejectCollaboration: async (trackId, artistId, callback) => {
    const query = `UPDATE user_track SET status = 'rejected' WHERE track_id = $1 AND user_id = $2 AND artist_role = 'collaborator'`;
    try {
      const result = await pool.query(query, [trackId, artistId]);
      callback(null, result);
    } catch (error) {
      return callback(error);
    }
  },
  getOrders: async (artistId) => {
    try {
      const query = `
                SELECT * FROM orders o 
                INNER JOIN order_merchandise om ON o.id = om.order_id 
                INNER JOIN merchandise m ON om.merchandise_id = m.id 
                WHERE artist_id = $1;
                `;
      const result = await pool.query(query, [artistId]);
      return result.rows;
    } catch (error) {
      throw new Error("Failed to get all orders by artist: " + error.message);
    }
  },
};

export default ArtistModel;
