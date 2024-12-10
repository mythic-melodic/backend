import pool from "../config/db.connect.js";

const PlayListModel = {
  createPlayList: async (name, creator_id, cover, description, callback) => {
    try {
      const query = `
                INSERT INTO playlists (name, creator_id, cover, description, date_created, date_modified) 
                VALUES ($1, $2, $3, $4, NOW(), NOW())
                RETURNING id
            `;

      const result = await pool.query(query, [name, creator_id, cover, description]);
      const playlist_id = result.rows[0].id;

      return callback(null,  { message: "Playlist created", playlist_id: playlist_id });
    } catch (error) {
      return callback(error);
    }
  },

  getAllPlaylists: async (callback) => {
    try {
      const query = `SELECT * FROM playlists`;
      const result = await pool.query(query);
      return callback(null, result.rows);
    } catch (error) {
      return callback(error);
    }
  },

  getPlaylistById: async (playlist_id, callback) => {
    try {
      const query = `SELECT * FROM playlists WHERE id = $1`;
      const result = await pool.query(query, [playlist_id]);
      if (result.rows.length === 0) {
        return callback("Playlist not found");
      }
      return callback(null, result.rows);
    } catch (error) {
      return callback(error);
    }
  },

  getAllPlaylistsByCreator: async (creator_id, callback) => {
    try {
      const query = `SELECT * FROM playlists WHERE creator_id = $1`;
      const result = await pool.query(query, [creator_id]);
      return callback(null, result.rows);
    } catch (error) {
      return callback(error);
    }
  },

  updatePlaylist: async (playlist_id, name, description, callback) => {
    try {
      const query = `UPDATE playlists SET name = $1, description = $2, date_modified = NOW() WHERE id = $3`;
      await pool.query(query, [name, description, playlist_id]);
      return callback(null, "Playlist updated");
    } catch (error) {
      return callback(error);
    }
  },

  deletePlaylist: async (playlist_id, callback) => {
    try {
      const query = `DELETE FROM playlists WHERE id = $1`;
      await pool.query(query, [playlist_id]);
      return callback(null, "Playlist deleted");
    } catch (error) {
      return callback(error);
    }
  },

  getAllTracksInPlaylist: async (playlist_id, callback) => {
    try {
      const query = `SELECT * FROM playlist_track WHERE playlist_id = $1`;
      const result = await pool.query(query, [playlist_id]);
      return callback(null, result.rows);
    } catch (error) {
      return callback(error);
    }
  },

  addTrackToPlaylist: async (playlist_id, track_id, callback) => {
    try {
      const query = `
        WITH next_order AS (
          SELECT COALESCE(MAX(track_order), 0) + 1 AS next_track_order
          FROM playlist_track
          WHERE playlist_id = $1
        )
        INSERT INTO playlist_track (playlist_id, track_id, track_order, added_at)
        SELECT $1, $2, next_track_order, NOW()
        FROM next_order
        ON CONFLICT (playlist_id, track_id) DO NOTHING
        RETURNING *;`; // Return the inserted row, if successful
  
      const result = await pool.query(query, [playlist_id, track_id]);
  
      if (result.rowCount === 0) {
        // If no rows were inserted, it means the track already exists
        return callback(null, "Track already exists in the playlist");
      }
  
      // If successful, return a success message
      return callback(null, "Track added to playlist");
    } catch (error) {
      console.error("Error adding track to playlist:", error);
      return callback(error);
    }
  },
  

deleteTrackFromPlaylist: async (playlist_id, track_id, callback) => {
  try {
    // Step 1: Find the `track_order` of the track being deleted
    const findOrderQuery = `SELECT track_order FROM playlist_track WHERE playlist_id = $1 AND track_id = $2`;
    const result = await pool.query(findOrderQuery, [playlist_id, track_id]);

    // If the track to delete is found
    if (result.rows.length > 0) {
      const trackOrder = result.rows[0].track_order;

      // Step 2: Delete the track from the playlist
      const deleteQuery = `DELETE FROM playlist_track WHERE playlist_id = $1 AND track_id = $2`;
      await pool.query(deleteQuery, [playlist_id, track_id]);

      // Step 3: Update `track_order` of subsequent tracks
      const updateOrderQuery = `
        UPDATE playlist_track
        SET track_order = track_order - 1
        WHERE playlist_id = $1 AND track_order > $2
      `;
      await pool.query(updateOrderQuery, [playlist_id, trackOrder]);

      return callback(null, "Track deleted from playlist");
    } else {
      // Track not found
      return callback(null, "Track not found in playlist");
    }
  } catch (error) {
    return callback(error);
  }
  // try {
  //   const query = `DELETE FROM playlist_track WHERE playlist_id = $1 AND track_id = $2`;
  //   await pool.query(query, [playlist_id, track_id]);
  //   return callback(null, "Track deleted from playlist");
  // } catch (error) {
  //   return callback(error);
  // }
},

// changeTrackOrder: async (playlist_id, song_id, new_order, callback) => {
//   try {
//     // Step 1: Get the current `track_order` of the specified track
//     const findOrderQuery = `SELECT track_order FROM playlist_track WHERE playlist_id = $1 AND track_id = $2`;
//     const result = await pool.query(findOrderQuery, [playlist_id, song_id]);

//     // Check if the track was found
//     if (result.rows.length === 0) {
//       return callback(null, "Track not found in playlist");
//     }

//     const currentOrder = result.rows[0].track_order;

//     // Step 2: Adjust `track_order` of other tracks
//     if (currentOrder < new_order) {
//       // If moving down in the order, decrement `track_order` for tracks in between
//       const decrementOrderQuery = `
//         UPDATE playlist_track
//         SET track_order = track_order - 1
//         WHERE playlist_id = $1 AND track_order > $2 AND track_order <= $3
//       `;
//       await pool.query(decrementOrderQuery, [playlist_id, currentOrder, new_order]);
//     } else if (currentOrder > new_order) {
//       // If moving up in the order, increment `track_order` for tracks in between
//       const incrementOrderQuery = `
//         UPDATE playlist_track
//         SET track_order = track_order + 1
//         WHERE playlist_id = $1 AND track_order >= $3 AND track_order < $2
//       `;
//       await pool.query(incrementOrderQuery, [playlist_id, currentOrder, new_order]);
//     }

//     // Step 3: Update the track's `track_order` to the new position
//     const updateOrderQuery = `
//       UPDATE playlist_track
//       SET track_order = $1
//       WHERE playlist_id = $2 AND track_id = $3
//     `;
//     await pool.query(updateOrderQuery, [new_order, playlist_id, song_id]);

//     return callback(null, "Track order changed successfully");
//   } catch (error) {
//     return callback(error);
//   }
// },
}
  

export default PlayListModel;
