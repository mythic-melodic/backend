import pool from "../config/db.connect.js";
import createId from "../hooks/idGenerator.js";
const ArtistModel = {
    create: async (artist_name, artist_bio, artist_img, callback) => {
        const query = `INSERT INTO artists (artist_name, artist_bio, artist_img) VALUES ($1, $2, $3) RETURNING *`;
        try {
            const result = await pool.query(query, [artist_name, artist_bio, artist_img]);
            callback(null, result.rows[0]);
        } catch (error) {
            return callback(error);
        }
    },
    getAll: async (callback) => {
        const query = `SELECT * FROM users WHERE user_role = $1`;
        try {
            const result = await pool.query(query, ['artist']);
            callback(null, result);
        } catch (error) {
            return callback(error);
        }
    },
    getById: async (id, callback) => {
        const query = `SELECT * FROM users WHERE id = $1 and user_role = $2`;
        try {
            const result = await pool.query(query, [id, 'artist']);
            callback(null, result);
        } catch (error) {
            return callback(error);
        }
    }
    ,
    getTopTracks: async (artistId, callback) => {
  
    try {
        const query = `SELECT tracks.id AS track_id, tracks.title AS title, tracks.track_url, albums.cover as cover  , COUNT(plays.track_id) AS play_count 
                        FROM plays_user_track AS plays
                        INNER JOIN tracks ON tracks.id = plays.track_id
                        INNER JOIN user_track AS uploads ON uploads.track_id = tracks.id
                        INNER JOIN users ON users.id = uploads.user_id
                        inner join track_album on track_album.track_id = tracks.id
                        inner join albums on albums.id = track_album.album_id
                        WHERE users.id = $1 
                        GROUP BY tracks.id, albums.id
                        ORDER BY play_count DESC`;
        const trackResult = await pool.query(query, [artistId]);
        // console.log(trackResult.rows);
        const artistQuery = `SELECT users.display_name, users.username, users.id FROM user_track
            INNER JOIN users ON user_track.user_id = users.id 
            WHERE user_track.track_id = $1`;
        
        // console.log(artistResult.rows);
        if(trackResult.rows.length === 0) {
        return callback({ message: 'No tracks found' });
        }
        const results = await Promise.all(trackResult.rows.map(async (track) => {
          const artistResult = await pool.query(artistQuery, [track.track_id]);
          return {
            id: track.track_id,
            title: track.title,
            track_url: track.track_url,
            cover: track.cover,
            artists: artistResult.rows.map((row) => ({
                id: row.id,
                display_name: row.display_name,
                username: row.username
              })), // Assuming multiple artists
          };
        }));
        
        // console.log(results);
        
        // console.log(results);
        // console.log(result);
        callback(null, results);
        } catch (error) {
        callback(error);
        }
    },
    getLastestTracks: async (artistId, callback) => {
        const query = `SELECT tracks.id as id, tracks.title as title, tracks.release_date, track_url,
                        artist_role, albums.cover as cover
                        FROM tracks
                        inner join track_album on tracks.id = track_album.track_id
                        inner join albums on track_album.album_id = albums.id
                        inner join user_track on tracks.id = user_track.track_id
                        WHERE user_track.user_id = $1 and tracks.status = 'public' ORDER BY tracks.release_date DESC LIMIT 1`;
        try {
            const trackResult = await pool.query(query, [artistId]);
            const artistQuery = `SELECT users.display_name FROM user_track
            INNER JOIN users ON user_track.user_id = users.id 
            WHERE user_track.track_id = $1`;
            const artistResult = await pool.query(artistQuery, [trackResult.rows[0].id]);
            const result = {
                id: trackResult.rows[0]?.id,
                title: trackResult.rows[0]?.title,
                track_url: trackResult.rows[0]?.track_url,
                cover: trackResult.rows[0]?.cover,
                release_date: trackResult.rows[0]?.release_date,
                artists: artistResult.rows.map((row) => row.display_name), // Assuming multiple artists
            }
            callback(null, result);
        } catch (error) {
            return callback(error);
        }
    }
    ,
    addAlbum: async (album, cover, callback) => {
        const { title, release_date, description, album_type, artist_id } = album;
        try {
            const checkArtist = `SELECT * FROM users WHERE id = $1 and user_role = 'artist'`;
            const artist = await pool.query(checkArtist, [artist_id]);
            if(artist.rowCount === 0) {
                return callback({ message: 'Artist not found' });
            }
            const checkAlbum = `SELECT * FROM albums WHERE title = $1 and artist_id = $2`;
            const albumExists = await pool.query(checkAlbum, [title, artist_id]);
            if(albumExists.rowCount > 0) {
                return callback({ message: 'Album already exists' });
            }
            const id = createId();
            const query = `INSERT INTO albums (id, title, release_date, description, cover, album_type, artist_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
            
            const result = await pool.query(query, [id, title, release_date, description, cover, album_type, artist_id]);
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
                SELECT o.* FROM orders o 
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

  getAllTracks: async (artistId) => {
    try {
      const query = `SELECT t.id AS track_id, t.title AS track_title, a.title AS album_title, DATE(ut.created_at) AS created_at, count(put.track_id) AS streams 
                    FROM tracks t
                    LEFT JOIN plays_user_track put ON put.track_id = t.id
                    INNER JOIN user_track ut ON ut.track_id = t.id 
                    INNER JOIN users u ON u.id = ut.user_id 
                    INNER JOIN albums a ON a.artist_id = u.id 
                    WHERE u.id = $1 and ut.status = 'approved'
                    GROUP BY t.id, t.title, a.title, ut.created_at`;
      const result = await pool.query(query, [artistId]);
      return result.rows;
    } catch (error) {
      throw new Error("Failed to get all tracks by artist: " + error.message);
    }
  },
};

export default ArtistModel;
