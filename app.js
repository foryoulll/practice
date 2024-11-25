const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const dotenv = require("dotenv");
const multer = require("multer");
const pool = require("./config/dbConfig");
const authRoutes = require("./routes/authRoutes");

dotenv.config(); // .envファイルを読み込む

const app = express();

// ミドルウェア設定
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

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.set("view engine", "ejs");

// セッションチェックミドルウェア
const ensureAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect("/sign_in.html");
    }
    next();
};

// ルーティング設定
app.use(authRoutes);

// ホーム (ログイン状態をチェックしてリダイレクト)
app.get("/", (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, "public", "upload_image.html")); // サインイン後、アップロードページに移動
    } else {
        res.redirect("/sign_in.html"); // 未ログインの場合はサインインページへ
    }
});

// ファイルアップロード設定
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

// 画像アップロード処理
app.post("/upload", ensureAuthenticated, upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("No file uploaded.");
        }

        const { originalname, mimetype, filename } = req.file;
        const filePath = path.join("uploads", filename);
        const userId = req.session.user.id;

        await pool.query(
            "INSERT INTO schema1.images (name, type, path, user_id) VALUES ($1, $2, $3, $4)",
            [originalname, mimetype, filePath, userId]
        );

        res.redirect("/gallery");
    } catch (err) {
        console.error("Error during image upload:", err);
        res.status(500).send("An error occurred while processing your request.");
    }
});

// 画像ギャラリー
app.get("/gallery", ensureAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { rows: images } = await pool.query(
            "SELECT * FROM schema1.images WHERE user_id = $1",
            [userId]
        );
        res.render("gallery", { images });
    } catch (err) {
        console.error("Error retrieving images:", err);
        res.status(500).send("Error retrieving images.");
    }
});

// ログアウト処理
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/sign_in.html");
    });
});

// サーバー起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
