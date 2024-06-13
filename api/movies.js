const express = require("express");
const router = express.Router();
const { pool } = require("../database/dbinfo");
const axios = require("axios");

// get all title of movies
router.get("/names-of-movies", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(`SELECT _id, title, year FROM movies`);
    const title_movies = result.recordset;
    res.json({ data: title_movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

// get film with title
router.get("/get-film-with-title", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("title", req.query.title)
      .query(`SELECT * FROM movies where title=@title`);
    const title_movies = result.recordset;
    res.json({ data: title_movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

// get movie with category
router.get("/get-all-movie-with-cat", async (req, res) => {
  // console.log(req.query);
  try {
    const page = parseInt(req.query.page) || 1; // Chuyển đổi page thành số nguyên
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    // console.log(offset);
    // console.log(typeof(offset));
    const category = req.query.category;

    await pool.connect();
    const result = await pool
      .request()
      .input("category", category)
      .input("offset", offset)
      .input("limit", limit)
      .query(
        `SELECT * FROM movies WHERE category = @category ORDER BY _id desc OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`
      );

    const movies = result.recordset;

    // Đếm tổng số lượng phim
    const countResult = await pool
      .request()
      .input("category", category)
      .query(
        `SELECT COUNT(*) AS totalCount FROM movies WHERE category = @category`
      );
    const totalCount = countResult.recordset[0].totalCount;

    const totalPages = Math.ceil(totalCount / limit);

    const info = {
      count: totalCount,
      pages: totalPages,
      next:
        page < totalPages
          ? `${req.path}?page=${page + 1}&category=${category}`
          : null,
      prev:
        page > 1 ? `${req.path}?page=${page - 1}&category=${category}` : null,
    };

    // Tạo đối tượng JSON phản hồi
    const response = {
      info: info,
      results: movies,
    };

    res.json(response);
  } catch (error) {
    res.status(500).json(error);
  }
});

// get film 18 + movies
router.get("/get-all-movie-18-plus", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Chuyển đổi page thành số nguyên
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    // console.log(offset);
    // console.log(typeof(offset));
    // const category = req.query.category;

    await pool.connect();
    const result = await pool
      .request()
      // .input("category", category)
      .input("offset", offset)
      .input("limit", limit)
      .query(
        `SELECT * FROM movies WHERE category = '18PlusFilm' ORDER BY _id desc OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`
      );

    const movies = result.recordset;

    // Đếm tổng số lượng phim
    const countResult = await pool
      .request()
      // .input("category", category)
      .query(
        `SELECT COUNT(*) AS totalCount FROM movies WHERE category = '18PlusFilm'`
      );
    const totalCount = countResult.recordset[0].totalCount;

    const totalPages = Math.ceil(totalCount / limit);

    const info = {
      count: totalCount,
      pages: totalPages,
      next: page < totalPages ? `${req.path}?page=${page + 1}` : null,
      prev: page > 1 ? `${req.path}?page=${page - 1}` : null,
    };

    // Tạo đối tượng JSON phản hồi
    const response = {
      info: info,
      results: movies,
    };

    res.json(response);
  } catch (error) {
    res.status(500).json(error);
  }
});

// get film bộ movies
router.get("/get-all-movie-phimbo", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Chuyển đổi page thành số nguyên
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    await pool.connect();

    // Lấy các tiêu đề duy nhất của phim bộ và phân trang kết quả
    const result = await pool
      .request()
      .input("offset", offset)
      .input("limit", limit).query(`
        SELECT title, MAX(_id) AS _id, image
        FROM movies_series
        GROUP BY title, image
        ORDER BY _id DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `);

    const movies = result.recordset;

    // Đếm tổng số lượng phim bộ
    const countResult = await pool.request().query(`
        SELECT COUNT(DISTINCT title) AS totalCount
        FROM movies_series
      `);
    const totalCount = countResult.recordset[0].totalCount;

    const totalPages = Math.ceil(totalCount / limit);

    const info = {
      count: totalCount,
      pages: totalPages,
      next: page < totalPages ? `${req.path}?page=${page + 1}` : null,
      prev: page > 1 ? `${req.path}?page=${page - 1}` : null,
    };

    // Tạo đối tượng JSON phản hồi
    const response = {
      info: info,
      results: movies,
    };

    res.json(response);
  } catch (error) {
    res.status(500).json(error);
  }
});

// get top 10 with categories
router.get("/get-top-10-movie-with-cat", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("category", req.query.category)
      .query(
        `select top 10 * from movies where category = @category order by createdAt`
      );
    const movies = result.recordset;
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

// get top 12 movies series
router.get("/get-top-10-movie-series", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool.request()
      .query(`SELECT top 12 title, MAX(_id) AS _id, image
      FROM movies_series
      GROUP BY title, image`);
    const movies = result.recordset;
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

// get tất cả các tập phim
router.get("/get-all-tap-film-bo-with-tile", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("title", req.query.title)
      .query(`SELECT * from movies_series where title = @title`);
    const movies = result.recordset;
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

// get top 10 movies ngẫu nhiên
router.get("/get-top-10-movie-slider-film", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(`SELECT TOP 10 * FROM movies ORDER BY NEWID();`);
    const movies = result.recordset;
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

// get top 12 movies ngẫu nhiên trong video liên quan
router.get("/get-top-12-movie-relative-film", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("category", req.query.category)
      .query(
        `SELECT TOP 12 * FROM movies where category = @category ORDER BY createdAt desc;`
      );
    const movies = result.recordset;
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

// get top 12 movies ngẫu nhiên trong video liên quan phim bộ
router.get("/get-top-12-movie-relative-film-series", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("category", req.query.category)
      .query(
        `SELECT top 12 title, MAX(_id) AS _id, image, createdAt
        FROM movies_series
        GROUP BY title, image, createdAt ORDER BY createdAt desc;`
      );
    const movies = result.recordset;
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

// get top movies hành động
router.get("/get-top-10-movie-hanhdong", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(
        `select top 12 * from movies where category = 'ActionFilm' ORDER BY NEWID();`
      );
    const movies = result.recordset;
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

// get top 10 movies lẻ
router.get("/get-top-12-movie-single", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool.request().query(
      `select top 12 * from movies where category <> 'ActionFilm' and category <> '18PlusFilm'
        and category <> 'AnimelFilm' and category <> 'AnimelFilm' 
        order by createdAt desc`
    );
    const movies = result.recordset;
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

// get top 10 movies võ thuật
router.get("/get-top-10-movie-vothuat", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(
        `select top 10 * from movies where category = 'MartialFilm' order by createdAt`
      );
    const movies = result.recordset;
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

// get top 10 movies kinh dị
router.get("/get-top-10-movie-kinhdi", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(
        `select top 10 * from movies where category = 'HorrorFilm' order by createdAt`
      );
    const movies = result.recordset;
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

// get top 12 movies kinh dị
router.get("/get-top-10-movie-anime", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(
        `select top 12 * from movies where category = 'AnimelFilm' order by createdAt desc`
      );
    const movies = result.recordset;
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

// get top 10 movies chiến tranh
router.get("/get-top-10-movie-war", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(
        `select top 10 * from movies where category = 'WarFilm' order by createdAt`
      );
    const movies = result.recordset;
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

// get top 10 movies hình sự
router.get("/get-top-10-movie-poli", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(
        `select top 10 * from movies where category = 'PolFilm' order by createdAt`
      );
    const movies = result.recordset;
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

// get top 10 movies tình cảm
router.get("/get-top-10-movie-love", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(
        `select top 10 * from movies where category = 'LoveFilm' order by createdAt`
      );
    const movies = result.recordset;
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

// get top 10 movies học đường
router.get("/get-top-10-movie-student", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(
        `select top 10 * from movies where category = 'StudentFilm' order by createdAt`
      );
    const movies = result.recordset;
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

// get top 10 movies thể thao
router.get("/get-top-10-movie-sport", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(
        `select top 10 * from movies where category = 'SportFilm' order by createdAt`
      );
    const movies = result.recordset;
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

// get top 10 movies viễn tưởng
router.get("/get-top-10-movie-fiction", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(
        `select top 10 * from movies where category = 'FictionlFilm' order by createdAt`
      );
    const movies = result.recordset;
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

// get top 10 movies kinh điển
router.get("/get-top-10-movie-classic", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(
        `select top 10 * from movies where category = 'ClassicFilm' order by createdAt`
      );
    const movies = result.recordset;
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

// get top 10 movies tâm lý
router.get("/get-top-10-movie-tamly", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(
        `select top 10 * from movies where category = 'SoulFilm' order by createdAt`
      );
    const movies = result.recordset;
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

// get top 10 movies music
router.get("/get-top-10-movie-music", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(
        `select top 10 * from movies where category = 'MusicFilm' order by createdAt`
      );
    const movies = result.recordset;
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

// get top 10 movies bí ẩn
router.get("/get-top-10-movie-bian", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(
        `select top 10 * from movies where category = 'SecretFilm' order by createdAt`
      );
    const movies = result.recordset;
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

// get top 10 movies cổ trang
router.get("/get-top-10-movie-cotrang", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(
        `select top 10 * from movies where category = 'CotrangFilm' order by createdAt`
      );
    const movies = result.recordset;
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

// get top 10 movies funny
router.get("/get-top-10-movie-haihuoc", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(
        `select top 10 * from movies where category = 'FunnyFilm' order by createdAt`
      );
    const movies = result.recordset;
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

// get top 10 movies chinhkich
router.get("/get-top-10-movie-chinkich", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(
        `select top 10 * from movies where category = 'ChinhkichFilm' order by createdAt`
      );
    const movies = result.recordset;
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

// get top 10 movies thanthoai
router.get("/get-top-10-movie-thanthoai", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(
        `select top 10 * from movies where category = 'ThanthoaiFilm' order by createdAt`
      );
    const movies = result.recordset;
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

// get top 10 movies gia đình
router.get("/get-top-10-movie-family", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(
        `select top 10 * from movies where category = 'FamilyFilm' order by createdAt`
      );
    const movies = result.recordset;
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

// get top 10 movies 18 plus
router.get("/get-top-10-movie-18plus", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(
        `select top 12 * from movies where category = '18PlusFilm' order by createdAt desc`
      );
    const movies = result.recordset;
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

// search for movies
router.get("/search-movie", async (req, res) => {
  // console.log(req.query.query);
  try {
    const searchQuery = req.query.query
    await pool.connect();
    const result = await pool
      .request()
      .query(
        `SELECT * FROM movies
        WHERE title COLLATE SQL_Latin1_General_CP1_CI_AI LIKE N'%${searchQuery}%' order by createdAt desc;`
      );
    const movies = result.recordset;
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

// search for movies - series
router.get("/search-movie-series", async (req, res) => {
  // console.log(req.query.query);
  try {
    const searchQuery = req.query.query
    await pool.connect();
    const result = await pool
      .request()
      .query(
        `WITH CTE AS (
          SELECT *,
                 ROW_NUMBER() OVER (PARTITION BY title ORDER BY createdAt DESC) AS rn
          FROM movies_series
          WHERE title COLLATE SQL_Latin1_General_CP1_CI_AI LIKE N'%${searchQuery}%'
          )
          SELECT *
          FROM CTE
          WHERE rn = 1
          ORDER BY createdAt DESC;`
      );
    const movies = result.recordset;
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/get-one-film/:_id", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("_id", req.params._id)
      .query(`select * from movies where _id=@_id`);
    const movies = result.recordset;
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/get-one-film-series/:_id", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("_id", req.params._id)
      .query(`select * from movies_series where _id=@_id`);
    const movies = result.recordset;
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
