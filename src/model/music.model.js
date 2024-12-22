import pool from "../config/db.connect.js";

const MusicModel = {
  addPlayRecord: async (user_id, track_id, callback) => {
    try {
      const query = `
                INSERT INTO plays_user_track (user_id, track_id, played_at) 
                VALUES (?, ?, NOW())
            `;

      await pool.query(query, [user_id, track_id]);

      return callback(null, { message: "Play record added" });
    } catch (error) {
      return callback(error);
    }
  },

  getPlayRecordByUser: async (user_id, callback) => {
    try {
      const query = `SELECT * FROM plays_user_track WHERE user_id = ?`;
      const [result] = await pool.query(query, [user_id]);
      return callback(null, result);
    } catch (error) {
      return callback(error);
    }
  },

  getPlayRecordByTrack: async (track_id, callback) => {
    try {
      const query = `SELECT * FROM plays_user_track WHERE track_id = ?`;
      const [result] = await pool.query(query, [track_id]);
      return callback(null, result);
    } catch (error) {
      return callback(error);
    }
  },

  updateTodayTopHitsPlaylist: async (callback) => {
    try {
      const query = `
                SELECT track_id, COUNT(*) AS play_count
                FROM plays_user_track
                WHERE played_at >= NOW() - INTERVAL 1 DAY
                GROUP BY track_id
                ORDER BY play_count DESC
                LIMIT 10;
            `;
      const [result] = await pool.query(query);

      if (result.length === 0) {
        return callback(null, "No tracks played in the last 24 hours.");
      }

      // 2. Tìm hoặc tạo playlist
      const getOrCreatePlaylistQuery = `
                INSERT INTO playlists (name, date_created, date_modified, creator_id)
                VALUES ('Today Top Hits', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 32)
                ON DUPLICATE KEY UPDATE date_modified = CURRENT_TIMESTAMP
                RETURNING id;
            `;
      const [playlistResult] = await pool.query(getOrCreatePlaylistQuery);
      const playlistId = playlistResult[0].id;

      // 3. Xóa các bài hát cũ
      await pool.query(`DELETE FROM playlist_track WHERE playlist_id = ?;`, [
        playlistId,
      ]);

      // 4. Chèn bài hát mới
      const insertValues = result.map((row) => [
        playlistId,
        row.track_id,
        new Date().toISOString(),
      ]);

      const placeholders = insertValues
        .map(
          (_, index) =>
            `(?, ?, ?)`
        )
        .join(", ");

      const batchInsertQuery = `
                INSERT INTO playlist_track (playlist_id, track_id, added_at)
                VALUES ${placeholders};
            `;

      const flattenedValues = insertValues.flat();
      await pool.query(batchInsertQuery, flattenedValues);

      return callback(null, "Playlist updated successfully!");
    } catch (error) {
      return callback(error);
    }
  },

  updateMelodicTopTracksPlaylist: async (callback) => {
    try {
      // 1. Truy vấn để lấy 10 bài hát phổ biến nhất trong 7 ngày qua
      const query = `
                SELECT track_id, COUNT(*) AS play_count
                FROM plays_user_track
                GROUP BY track_id
                ORDER BY play_count DESC
                LIMIT 10;
            `;
      const [result] = await pool.query(query);

      if (result.length === 0) {
        return callback(null, "No tracks played");
      }

      // 2. Tìm hoặc tạo playlist
      const getOrCreatePlaylistQuery = `
                INSERT INTO playlists (name, date_created, date_modified, creator_id)
                VALUES ('Melodic Top Tracks', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 32)
                ON DUPLICATE KEY UPDATE date_modified = CURRENT_TIMESTAMP
                RETURNING id;
            `;
      const [playlistResult] = await pool.query(getOrCreatePlaylistQuery);
      const playlistId = playlistResult[0].id;

      // 3. Xóa các bài hát cũ
      await pool.query(`DELETE FROM playlist_track WHERE playlist_id = ?;`, [
        playlistId,
      ]);

      // 4. Chèn bài hát mới
      const insertValues = result.map((row) => [
        playlistId,
        row.track_id,
        new Date().toISOString(),
      ]);

      const placeholders = insertValues
        .map(
          (_, index) =>
            `(?, ?, ?)`
        )
        .join(", ");

      const batchInsertQuery = `
                INSERT INTO playlist_track (playlist_id, track_id, added_at)
                VALUES ${placeholders};
            `;

      const flattenedValues = insertValues.flat();
      await pool.query(batchInsertQuery, flattenedValues);

      return callback(null, "Playlist updated successfully!");
    } catch (error) {
      return callback(error);
    }
  },

  updateTodayTopFavPlaylist: async (callback) => {
    try {
      const query = `SELECT track_id, COUNT(*) AS like_count
                FROM likes_user_track
                WHERE liked_at >= NOW() - INTERVAL 1 DAY
                GROUP BY track_id
                ORDER BY like_count DESC
                LIMIT 10;
            `;
      const [result] = await pool.query(query);

      if (result.length === 0) {
        return callback(null, "No tracks favorited in the last 24 hours.");
      }

      // 2. Tìm hoặc tạo playlist
      const getOrCreatePlaylistQuery = `
                INSERT INTO playlists (name, date_created, date_modified, creator_id)
                VALUES ('Today Top Favorite Tracks', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 32)
                ON DUPLICATE KEY UPDATE date_modified = CURRENT_TIMESTAMP
                RETURNING id;
            `;
      const [playlistResult] = await pool.query(getOrCreatePlaylistQuery);
      const playlistId = playlistResult[0].id;

      // 3. Xóa các bài hát cũ
      await pool.query(`DELETE FROM playlist_track WHERE playlist_id = ?;`, [
        playlistId,
      ]);

      // 4. Chèn bài hát mới
      const insertValues = result.map((row) => [
        playlistId,
        row.track_id,
        new Date().toISOString(),
      ]);

      const placeholders = insertValues
        .map(
          (_, index) =>
            `(?, ?, ?)`
        )
        .join(", ");

      const batchInsertQuery = `
                INSERT INTO playlist_track (playlist_id, track_id, added_at)
                VALUES ${placeholders};
            `;

      const flattenedValues = insertValues.flat();
      await pool.query(batchInsertQuery, flattenedValues);

      return callback(null, "Playlist updated successfully!");
    } catch (error) {
      return callback(error);
    }
  },

  getNewReleases: async (callback) => {
    try {
      const query = `
                        WITH track_info AS (
                SELECT 
                    t.id, 
                    t.title, 
                    t.release_date, 
                    t.track_url,
                    t.duration,
                    a.cover AS cover
                FROM tracks t
                LEFT JOIN track_album ta ON t.id = ta.track_id
                LEFT JOIN albums a ON ta.album_id = a.id
            ),
            genres AS (
                SELECT 
                    tg.track_id,
                    tg.genre_id
                FROM track_genre tg
            ),
            artists AS (
                SELECT 
                    DISTINCT ut.track_id,
                    u.display_name,
                    u.id AS artist_id,
                    u.username as username
                FROM user_track ut
                INNER JOIN users u ON ut.user_id = u.id
            )
            SELECT 
                t.id,
                t.title,
                t.release_date,
                t.duration,
                t.track_url,
                t.cover,
                COALESCE(GROUP_CONCAT(DISTINCT g.genre_id), '') AS genres,
                COALESCE(
                    JSON_ARRAYAGG(
                        DISTINCT JSON_OBJECT('id', a.artist_id, 'display_name', a.display_name, 'username', a.username)
                    ), 
                    '[]'
                ) AS artists
            FROM 
                track_info t
            LEFT JOIN genres g ON t.id = g.track_id
            LEFT JOIN (
                SELECT 
                    DISTINCT track_id, 
                    artist_id, 
                    display_name,
                    username
                FROM artists
            ) a ON t.id = a.track_id
            WHERE 
                t.track_url IS NOT NULL
            GROUP BY 
                t.id, t.title, t.release_date, t.track_url, t.cover, t.duration
            ORDER BY 
                t.release_date DESC
            LIMIT 8;
            `;
      const [result] = await pool.query(query);
      return callback(null, result);
    } catch (error) {
      return callback(error);
    }
  },

  getTopAlbums: async (callback) => {
    try {
      const query = `
                        WITH album_plays AS (
                SELECT 
                    ta.album_id, 
                    COUNT(put.track_id) AS total_plays
                FROM track_album ta
                INNER JOIN plays_user_track put ON ta.track_id = put.track_id
                GROUP BY ta.album_id
            )
            SELECT 
                a.id AS id,
                a.title AS title,
                a.cover AS cover,
                ap.total_plays,
                u.id AS artist_id,
                u.display_name AS artists,
                a.release_date AS release_date
            FROM albums a
            INNER JOIN album_plays ap ON a.id = ap.album_id
            INNER JOIN users u ON a.artist_id = u.id
            ORDER BY ap.total_plays DESC
            LIMIT 10;
            `;
      const [result] = await pool.query(query);
      return callback(null, result);
    } catch (error) {
      return callback(error);
    }
  },

  getTopArtists: async (callback) => {
    try {
      const query = `
            WITH artist_plays AS (
            SELECT 
                ut.user_id AS artist_id, 
                COUNT(put.track_id) AS total_plays
            FROM user_track ut
            INNER JOIN plays_user_track put ON ut.track_id = put.track_id
            GROUP BY ut.user_id
            )
            SELECT 
            u.id AS artist_id,
            u.display_name AS artist_name,
            ap.total_plays,
            u.avatar as avatar
            FROM users u
            INNER JOIN artist_plays ap ON u.id = ap.artist_id
            ORDER BY ap.total_plays DESC
            LIMIT 10;
            `;
      const [result] = await pool.query(query);
      return callback(null, result);
    } catch (error) {
      return callback(error);
    }
  },

  getPublicPlaylists: async (callback) => {
    try {
      const query = `
            SELECT * 
            FROM playlists 
            WHERE is_public = true 
            AND name NOT IN ('Today Top Hits', 'Melodic Top Tracks', 'Today Top Favorite Tracks');
            `;
      const [result] = await pool.query(query);
      return callback(null, result);
    } catch (error) {
      return callback(error);
    }
  },
};
export default MusicModel;