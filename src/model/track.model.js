import pool from "../config/db.connect.js";
import createId from "../hooks/idGenerator.js";
const TrackModel = {
  getAllTracks: async (callback) => {
    try {
      const query = `SELECT * FROM tracks where track_url is not null limit 100`;
      const result = await pool.query(query);
      return callback(null, result.rows);
    } catch (error) {
      return callback(error);
    }
  },
  getById: async (id, callback) => {
    try {
      const trackQuery = `SELECT * FROM tracks WHERE id = $1`;
      const trackResult = await pool.query(trackQuery, [id]);

      if (trackResult.rows.length === 0) {
        return callback("Track not found");
      }

      const genreQuery = `SELECT genre_id FROM track_genre WHERE track_id = $1`;
      const genreResult = await pool.query(genreQuery, [id]);
      const artistQuery = `SELECT users.display_name, users.username, users.id FROM user_track
      INNER JOIN users ON user_track.user_id = users.id 
      WHERE user_track.track_id = $1`;
      const artistResult = await pool.query(artistQuery, [id]);
      const albumQuery = `select 
                        albums.id as id,
                        tracks.title as track_title,
                        albums.title as album_title,
                        albums.cover as cover
                        from tracks
                        inner join track_album on tracks.id = track_album.track_id
                        inner join albums on albums.id = track_album.album_id
                        where track_id = $1`;
      const albumResult = await pool.query(albumQuery, [id]);
      const result = {
        track: trackResult.rows[0],
        album: albumResult.rows.map((row) => ({
          id: row.id,
          album_title: row.album_title,
          cover: row.cover,
        })), // Assuming multiple albums
        genre: genreResult.rows.map((row) => row.genre_id), // Assuming multiple genres
        artists: artistResult.rows.map((row) => ({
          display_name: row.display_name,
          username: row.username,
          id: row.id,
        })), // Assuming multiple artists
      };
      // console.log(result);
      const trackInfo = {
        id: result.track.id,
        title: result.track.title,
        lyrics: result.track.lyrics,
        release_date: result.track.release_date,
        duration: result.track.duration,
        language: result.track.language,
        track_url: result.track.track_url,
        genres: result.genre.length > 0 ? result.genre : null, // If genres exist, include them, else null
        artists: result.artists.length > 0 ? result.artists : null,
        album: result.album.length > 0 ? result.album : null // If artists exist, include them, else null
      };
      return callback(null, trackInfo);
    } catch (error) {
      return callback(error);
    }
  },
  getAllTracksDisabled: async (callback) => {
    try {
      const query = `SELECT tracks.id, tracks.title, albums.cover, tracks.status, albums.artist_id
                      FROM tracks
                      inner JOIN track_album AS t1 ON tracks.id = t1.track_id
                      inner JOIN albums ON albums.id = t1.album_id
                      WHERE tracks.track_url IS NOT NULL AND tracks.status = 'disable';`;
      //tracks.track_url IS NOT NULL AND
      const result = await pool.query(query);
      return callback(null, result.rows);
    } catch (error) {
      return callback(error);
    }
  },

  enableTrack: async (id, callback) => {
    try {
      const checkCollaborator = await pool.query(
        `SELECT * FROM user_track WHERE track_id = $1 and status ='approved'`,
        [id]
      );
      if (checkCollaborator.rowCount === 0) {
        return callback("Track not approved by collaborator");
      }
      const query = `UPDATE tracks SET status = 'public' WHERE id = $1`;
      const result = await pool.query(query, [id]);
      return callback(null, result);
    } catch (error) {
      return callback(error);
    }
  },
  disableTrack: async (id, callback) => {
    try {
      const query = `DELETE FROM tracks WHERE id = $1`;
      const result = await pool.query(query, [id]);
      return callback(null, result);
    } catch (error) {
      return callback(error);
    }
  },

  deleteTrackById: async (id, callback) => {
    try {
      // Begin a transaction
      await pool.query("BEGIN");

      // Execute each DELETE statement with EXISTS condition
      await pool.query(
        `
        DELETE FROM track_album 
        WHERE track_id = $1 
        AND EXISTS (SELECT 1 FROM track_album WHERE track_id = $1);
      `,
        [id]
      );

      await pool.query(
        `
        DELETE FROM likes_user_track 
        WHERE track_id = $1 
        AND EXISTS (SELECT 1 FROM likes_user_track WHERE track_id = $1);
      `,
        [id]
      );

      await pool.query(
        `
        DELETE FROM track_genre 
        WHERE track_id = $1 
        AND EXISTS (SELECT 1 FROM track_genre WHERE track_id = $1);
      `,
        [id]
      );

      await pool.query(
        `
        DELETE FROM plays_user_track 
        WHERE track_id = $1 
        AND EXISTS (SELECT 1 FROM plays_user_track WHERE track_id = $1);
      `,
        [id]
      );

      await pool.query(
        `
        DELETE FROM playlist_track 
        WHERE track_id = $1 
        AND EXISTS (SELECT 1 FROM playlist_track WHERE track_id = $1);
      `,
        [id]
      );

      await pool.query(
        `
        DELETE FROM tracks 
        WHERE id = $1 
        AND EXISTS (SELECT 1 FROM tracks WHERE id = $1);
      `,
        [id]
      );

      // Commit the transaction
      await pool.query("COMMIT");

      return callback(null, { message: "Track deleted successfully" });
    } catch (error) {
      // Rollback in case of error
      await pool.query("ROLLBACK");
      return callback(error);
    }
  },

  addTrack: async (track, track_url, callback) => {
    try {
      const {
        title,
        lyrics,
        release_date,
        duration,
        language,
        user_id,
        genre,
        album,
      } = track;
      // const user_id = 8;
      // const artist_role = 'original artist';
      const id = createId();

      // Step 1: Check if the user exists
      const userCheckQuery = `SELECT * FROM users WHERE id = $1`;
      const checkArtist = await pool.query(userCheckQuery, [user_id]);

      if (checkArtist.rowCount === 0) {
        return callback({ status: 404, message: "User not found" });
      }

      // Step 2: Validate user role
      if (checkArtist.rows[0].user_role !== "artist") {
        return callback({ status: 403, message: "User is not an artist" });
      }

      // Step 3: Insert track into `tracks` table
      const insertTrackQuery = `
                INSERT INTO tracks (id, title, lyrics, release_date, duration, language, track_url) 
                VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
            `;
      const trackResult = await pool.query(insertTrackQuery, [
        id,
        title,
        lyrics,
        release_date,
        duration,
        language,
        track_url,
      ]);

      //Step 4: Insert track into `track_album` table
      const albumCheckQuery = `SELECT * FROM albums WHERE id = $1`;
      const checkAlbum = await pool.query(albumCheckQuery, [album]);
      if (checkAlbum.rowCount === 0) {
        const deleteTrackQuery = `DELETE FROM tracks WHERE id = $1`;
        await pool.query(deleteTrackQuery, [trackResult.rows[0].id]);
        return callback({ status: 404, message: "Album not found" });
      }

      const albumQuery = `
          INSERT INTO track_album (track_id, album_id) VALUES ($1, $2)
      `;
      await pool.query(albumQuery, [trackResult.rows[0].id, album]);

      // Step 5: Insert track into `track_genre` table
      for (let i = 0; i < genre.length; i++) {
        const checkGenreQuery = `SELECT * FROM genres WHERE id = $1`;
        const genreId = genre[i].toLowerCase();
        const checkGenre = await pool.query(checkGenreQuery, [genreId]);
        if (checkGenre.rowCount === 0) {
          const deleteTrackQuery = `DELETE FROM tracks WHERE id = $1`;
          await pool.query(deleteTrackQuery, [trackResult.rows[0].id]);
          const deleteAlbumQuery = `DELETE FROM track_album WHERE track_id = $1`;
          await pool.query(deleteAlbumQuery, [trackResult.rows[0].id]);
          return callback({ status: 404, message: "Genre not found" });
        }
        const genreQuery = `
                INSERT INTO track_genre (track_id, genre_id) VALUES ($1, $2)
            `;
        await pool.query(genreQuery, [trackResult.rows[0].id, genreId]);
      }

      // Step 6: insert track into 'user_track' table(collaborator)
      const collaborators = JSON.parse(track.collaborator);
      let sumProfit = 0;
      if (collaborators.length > 0 && collaborators[0].name !== "") {
        //console.log('Collaborators:', collaborators);

        for (let i = 0; i < collaborators.length; i++) {
          sumProfit += parseInt(collaborators[i].profitShare, 10);
          const userCheckQuery = `SELECT * FROM users WHERE username = $1`;
          const checkCollaborator = await pool.query(userCheckQuery, [
            collaborators[i].name,
          ]);
          if (checkCollaborator.rowCount === 0) {
            const deleteTrackQuery = `DELETE FROM tracks WHERE id = $1`;
            await pool.query(deleteTrackQuery, [trackResult.rows[0].id]);
            const deleteAlbumQuery = `DELETE FROM track_album WHERE track_id = $1`;
            await pool.query(deleteAlbumQuery, [trackResult.rows[0].id]);
            const deleteGenreQuery = `DELETE FROM track_genre WHERE track_id = $1`;
            await pool.query(deleteGenreQuery, [trackResult.rows[0].id]);
            return callback({ status: 404, message: "Collaborator not found" });
          }
          const relateQuery = `
              INSERT INTO user_track (user_id, track_id,  artist_role, profit_share) VALUES ($1, $2, $3, $4)
          `;
          await pool.query(relateQuery, [
            checkCollaborator.rows[0].id,
            trackResult.rows[0].id,
            "collaborator",
            collaborators[i].profitShare,
          ]);
        }
      }
      //console.log(sumProfit);
      const mainArtistProfit = 100 - sumProfit;
      if (mainArtistProfit < 0) {
        return callback({ status: 400, message: "Profit share is invalid" });
      }

      if(mainArtistProfit === 100){

        const mainArtistQuery = `INSERT INTO user_track (user_id, track_id, artist_role, profit_share, status) VALUES ($1, $2, $3, $4, $5)`;
        await pool.query(mainArtistQuery, [
          user_id,
          trackResult.rows[0].id,
          "original artist",
          mainArtistProfit,
          "approved",
        ]);
        return callback(null, {
          status: 200,
          message: "Track added successfully",
          track: trackResult.rows[0],
        });
      }
      const mainArtistQuery = `INSERT INTO user_track (user_id, track_id, artist_role, profit_share) VALUES ($1, $2, $3, $4)`;
      await pool.query(mainArtistQuery, [
        user_id,
        trackResult.rows[0].id,
        "original artist",
        mainArtistProfit,
      ]);
      return callback(null, {
        status: 200,
        message: "Track added successfully",
        track: trackResult.rows[0],
      });
    } catch (error) {
      console.error("Error in addTrack:", error);
      return callback({ status: 500, message: "Internal server error", error });
    }
  },
  updateTrack: async (track, callback) => {
    try {
      const {
        title,
        lyrics,
        release_date,
        duration,
        language,
        genre,
        album,
      } = track;
      const id = track.track_id;
      // Step 1: Check if the track exists
      const trackCheckQuery = `SELECT * FROM tracks WHERE id = $1`;
      const checkTrack = await pool.query(trackCheckQuery, [id]);
  
      if (checkTrack.rowCount === 0) {
        return callback({ status: 404, message: "Track not found" });
      }
  
      // Step 2: Update track in `tracks` table
      const updateTrackQuery = `
                UPDATE tracks 
                SET title = $1, lyrics = $2, release_date = $3, duration = $4, language = $5
                WHERE id = $6
                RETURNING *;
            `;
      const trackResult = await pool.query(updateTrackQuery, [
        title,
        lyrics,
        release_date,
        duration,
        language,
        id,
      ]);
  
      // Step 3: Update track in `track_album` table
      const updateAlbumQuery = `
                UPDATE track_album 
                SET album_id = $1
                WHERE track_id = $2;
            `;
      await pool.query(updateAlbumQuery, [album, id]);
  
      // Step 4: Delete existing entries in `track_genre` table
   // Step 4: Update entries in `track_genre` table
for (let i = 0; i < genre.length; i++) {
  const genreId =  genre[i].toLowerCase();

  // Check if the combination of track_id and genre_id already exists
  const checkGenreQuery = `SELECT 1 FROM track_genre WHERE track_id = $1 AND genre_id = $2`;
  const checkGenreResult = await pool.query(checkGenreQuery, [id, genreId]);

  if (checkGenreResult.rowCount === 0) {
    // If it does not exist, insert a new entry
    const insertGenreQuery = `
      INSERT INTO track_genre (track_id, genre_id) VALUES ($1, $2)
    `;
    await pool.query(insertGenreQuery, [id, genreId]);
  } else {
    // If it exists, update the entry (if there are other fields to update)
    // For this example, we assume there are no other fields to update
    // If there are, you can add the update logic here
  }
}
  
      // Step 6: Return success response
      return callback(null, {
        status: 200,
        message: "Track updated successfully",
        track: trackResult.rows[0],
      });
    } catch (error) {
      console.error("Error in updateTrack:", error);
      return callback({ status: 500, message: "Internal server error", error });
    }
  }
};
export default TrackModel;
