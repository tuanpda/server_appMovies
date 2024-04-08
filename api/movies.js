const express = require("express");
const router = express.Router();
const { pool } = require("../database/dbinfo");

// get all movies
// router.get("/get-all-movie", async (req, res) => {
//   try {
//     await pool.connect();
//     const result = await pool.request().query(`SELECT * FROM movies`);
//     const movies = result.recordset;
//     res.json({ data: movies, success: true });
//   } catch (error) {
//     res.status(500).json(error);
//   }
// });

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
      next:
        page < totalPages
          ? `${req.path}?page=${page + 1}`
          : null,
      prev:
        page > 1 ? `${req.path}?page=${page - 1}` : null,
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
      .query(`select top 10 * from movies where category = @category ORDER BY [_id] desc`);
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

// get top 10 movies hành động
router.get("/get-top-10-movie-hanhdong", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(`select top 10 * from movies where category = 'ActionFilm' order by _id desc`);
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
      .query(`select top 10 * from movies where category = 'MartialFilm' order by _id desc`);
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
      .query(`select top 10 * from movies where category = 'HorrorFilm' order by _id desc`);
    const movies = result.recordset;
    res.json({ data: movies, success: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

// get top 10 movies kinh dị
router.get("/get-top-10-movie-anime", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(`select top 10 * from movies where category = 'AnimelFilm' order by _id desc`);
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
      .query(`select top 10 * from movies where category = 'WarFilm' order by _id desc`);
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
      .query(`select top 10 * from movies where category = 'PolFilm' order by _id desc`);
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
      .query(`select top 10 * from movies where category = 'LoveFilm' order by _id desc`);
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
      .query(`select top 10 * from movies where category = 'StudentFilm' order by _id desc`);
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
      .query(`select top 10 * from movies where category = '18PlusFilm' order by _id desc`);
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
module.exports = router;
