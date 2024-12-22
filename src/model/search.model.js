import pool from "../config/db.connect.js";

const SearchModel = {
    searchTrack: async (search_query) => {
        try {
            const query = `
            WITH track_info AS (
    SELECT 
        t.id, 
        t.title, 
        t.release_date, 
        t.duration, 
        t.track_url,
        t.lyrics,
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
        ut.track_id,
        u.display_name,
        u.id AS artist_id,
        u.username
    FROM user_track ut
    INNER JOIN users u ON ut.user_id = u.id
)
SELECT 
    t.id,
    t.title,
    t.release_date,
    t.duration,
    t.track_url,
    t.lyrics,
    t.cover,
    COALESCE(GROUP_CONCAT(DISTINCT g.genre_id), '') AS genres,
    COALESCE(
        GROUP_CONCAT(
            DISTINCT CONCAT(
                '{"id": "', a.artist_id, '", "display_name": "', a.display_name, '", "username": "', a.username, '"}'
            )
        ), 
        ''
    ) AS artists
FROM 
    track_info t
LEFT JOIN genres g ON t.id = g.track_id
LEFT JOIN artists a ON t.id = a.track_id
WHERE 
    t.track_url IS NOT NULL AND  -- Bỏ qua các track không có track_url
    (t.title LIKE ? OR  -- Tìm kiếm trong title
    COALESCE(a.display_name, '') LIKE ? OR  -- Tìm kiếm trong display_name
    t.lyrics LIKE ?)  -- Tìm kiếm trong lyrics
GROUP BY 
    t.id, t.title, t.release_date, t.duration, t.track_url, t.cover, a.display_name
ORDER BY 
    CASE
        WHEN t.title LIKE ? THEN 1
        WHEN COALESCE(a.display_name, '') LIKE ? THEN 2
        WHEN t.lyrics LIKE ? THEN 3
        ELSE 4
    END,
    t.release_date DESC
LIMIT 12;

            `;
            const result = await pool.query(query, [`%${search_query}%`, `%${search_query}%`, `%${search_query}%`, `%${search_query}%`, `%${search_query}%`, `%${search_query}%`]);
            return result[0]; // Trả về dữ liệu từ query
        } catch (error) {
            throw error; // Ném lỗi để xử lý tại nơi gọi hàm
        }
    },
    
    
    searchArtist: async (search_query) => {
        try {
        const query = `SELECT * FROM users WHERE display_name LIKE ? AND user_role = 'artist'`;
        const result = await pool.query(query, [`%${search_query}%`]);
        return result[0];
        } catch (error) {
        return error;
        }
    },
    searchAlbum: async (search_query) => {
        try {
        const query = `SELECT * 
            FROM albums
            WHERE title LIKE ? OR description LIKE ?
            ORDER BY 
                CASE
                    WHEN title LIKE ? THEN 1
                    WHEN description LIKE ? THEN 2
                    ELSE 3
                END;`;
        const result = await pool.query(query, [`%${search_query}%`, `%${search_query}%`, `%${search_query}%`, `%${search_query}%`]);
        return result[0];
        } catch (error) {
        return error;
        }
    },

    browseByGenre: async (genre_id, limit, offset) => {
        try {
        const query = `
   WITH track_info AS (
    SELECT 
        t.id, 
        t.title, 
        t.duration, 
        t.release_date,
        t.track_url,
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
        ut.track_id,
        u.display_name,
        u.id AS artist_id,
        u.username
    FROM user_track ut
    INNER JOIN users u ON ut.user_id = u.id
)
SELECT 
    t.id,
    t.title,
    t.duration,
    t.cover,
    t.release_date,
    t.track_url,
    COALESCE(GROUP_CONCAT(DISTINCT g.genre_id), '') AS genres,
    COALESCE(
        GROUP_CONCAT(
            DISTINCT CONCAT(
                '{"id":"', a.artist_id, '", "display_name":"', a.display_name, '", "username":"', a.username, '"}'
            ) 
        ), 
        ''  -- Empty string in case of no artists
    ) AS artists
FROM 
    track_info t
LEFT JOIN genres g ON t.id = g.track_id
LEFT JOIN artists a ON t.id = a.track_id
WHERE
    t.track_url IS NOT NULL 
    AND g.genre_id = ?  -- Filter by genre_id
GROUP BY 
    t.id, t.title, t.release_date, t.duration, t.cover, t.track_url
ORDER BY 
    t.release_date DESC
LIMIT ? OFFSET ?;  -- Apply pagination


        `;
        const result = await pool.query(query, [genre_id, limit, offset]);
        return result[0];
        } catch (error) {
        throw error;
        }
    },

};

export default SearchModel;