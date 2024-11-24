// app.js
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const dotenv = require("dotenv");
const multer = require("multer");

const pool = require("./config/dbConfig"); // dbConfig.js から pool をインポート
dotenv.config();  // .envファイルを読み込む

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

// ルーティングを設定
app.use(authRoutes);

// ダッシュボードページ
app.get("/dashboard", (req, res) => {
    if (req.session.user) {
        res.send(`
            <h1>Welcome, ${req.session.user.name}!</h1>
            <p>This is your personalized dashboard.</p>
            <a href="/logout">Log out</a>
        `);
    } else {
        res.redirect("/sign_in.html"); // セッションがない場合、サインインページにリダイレクト
    }
});

// ログアウト処理
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/sign_in.html"); // ログアウト後はサインインページにリダイレクト
    });
});

// image用ミドルウェア設定
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.set("view engine", "ejs");

const upload = multer({
    dest: "uploads/",
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error("Invalid file type."));
        }
        cb(null, true);
    },
});

// 画像アップロードフォーム
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "upload_image.html"));
});

// 画像アップロード処理
app.post("/upload", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("No file uploaded.");
        }

        const { originalname, mimetype, filename } = req.file;
        const filePath = path.join("uploads", filename);

        await pool.query(
            "INSERT INTO schema1.images (name, type, path) VALUES ($1, $2, $3)",
            [originalname, mimetype, filePath]
        );

        res.redirect("/gallery");
    } catch (err) {
        console.error("Error during image upload:", err);
        res.status(500).send("An error occurred while processing your request.");
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
    console.log(`Server running on http://localhost:${PORT}`);
});