必要なパッケージ
以下のパッケージを使用します。事前にインストールしてください。

```
npm install express multer pg ejs body-parser
```

app.js
```
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const { Pool } = require("pg");
const path = require("path");

const app = express();
const pool = new Pool({
  user: "your_user",
  host: "localhost",
  database: "your_database",
  password: "your_password",
  port: 5432,
});

const upload = multer({ dest: "uploads/" });

// ミドルウェア設定
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// 画像アップロードフォーム
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 画像アップロード処理
app.post("/upload", upload.single("image"), async (req, res) => {
  const { originalname, mimetype, filename } = req.file;
  const filePath = path.join("uploads", filename);
  
  try {
    await pool.query(
      "INSERT INTO images (name, type, path) VALUES ($1, $2, $3)",
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
    const { rows: images } = await pool.query("SELECT * FROM images");
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
```

upload用html
```
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Upload Image</title>
  <link rel="stylesheet" href="./css/style.css">
</head>
<body>
  <h1>Upload Image</h1>
  <form action="/upload" method="POST" enctype="multipart/form-data">
    <input type="file" name="image" required>
    <button type="submit">Upload</button>
  </form>
</body>
</html>
``

gallery.ejs（画像出力）
```
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Image Gallery</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <h1>Image Gallery</h1>
  <div>
    <% images.forEach(image => { %>
      <div>
        <img src="<%= image.path %>" alt="<%= image.name %>" style="max-width: 200px;">
        <p><%= image.name %></p>
      </div>
    <% }); %>
  </div>
  <a href="/">Go back to upload</a>
</body>
</html>
```

画像サイズを圧縮するライブラリを使用するのがおすすめです。

例: Sharpを使用した圧縮

bash
コードをコピーする
npm install sharp