const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const { Pool } = require("pg");
const path = require("path");

const app = express();
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "postgres",
  port: 5432,
});

const upload = multer({ dest: "uploads/" });

// ミドルウェア設定
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.set("view engine", "ejs");

// 画像アップロードフォーム
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "image_index.html"));
});

// 画像アップロード処理
app.post("/upload", upload.single("image"), async (req, res) => {
  const { originalname, mimetype, filename } = req.file;
  const filePath = path.join("uploads", filename);
  
  try {
    await pool.query(
      "INSERT INTO schema1.images (name, type, path) VALUES ($1, $2, $3)",
      [originalname, mimetype, filePath]
    );
    res.redirect("/gallery");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving the image.");
  }
});

// 保存された画像の一覧表示
app.get("/gallery", async (req, res) => {
  try {
    const { rows: images } = await pool.query("SELECT * FROM schema1.images");
    res.render("gallery", { images });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving images.");
  }
});

// サーバー起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
