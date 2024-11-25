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
        res.sendFile(path.join(__dirname, "views", "gallery.ejs")); // サインイン後、アップロードページに移動
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
// galleryページ表示と画像アップロードフォームを統合
app.get("/gallery", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/sign_in.html");
        }

        const userId = req.session.user.id;
        const { rows: images } = await pool.query(
            "SELECT * FROM schema1.images WHERE user_id = $1",
            [userId]
        );

        res.render("gallery", { user: req.session.user, images });
    } catch (err) {
        console.error("Error retrieving gallery:", err);
        res.status(500).send("Error retrieving gallery.");
    }
});

// 画像アップロード処理 (最大9枚まで)
app.post("/upload", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("No file uploaded.");
        }
        if (!req.session.user) {
            return res.status(401).send("You must be logged in to upload images.");
        }

        // ユーザーの画像枚数をチェック
        const userId = req.session.user.id;
        const { rows: imageCount } = await pool.query(
            "SELECT COUNT(*) FROM schema1.images WHERE user_id = $1",
            [userId]
        );

        if (parseInt(imageCount[0].count) >= 9) {
            return res.status(400).send("You can only upload up to 9 images.");
        }

        const { originalname, mimetype, filename } = req.file;
        const filePath = path.join("uploads", filename);

        // 画像の情報をデータベースに保存
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

// 画像編集処理 (例: 画像名の変更)
app.post("/edit_image", async (req, res) => {
    try {
        const { imageId, newName } = req.body;  // 画像IDと新しい名前を取得

        if (!newName || !imageId) {
            return res.status(400).send("Invalid data.");
        }

        // 画像名をデータベースで更新
        await pool.query(
            "UPDATE schema1.images SET name = $1 WHERE id = $2 AND user_id = $3",
            [newName, imageId, req.session.user.id]
        );

        res.redirect("/gallery");  // 編集後にギャラリーにリダイレクト
    } catch (err) {
        console.error("Error editing image:", err);
        res.status(500).send("An error occurred while editing the image.");
    }
});

// 画像削除処理
app.post("/delete_image", async (req, res) => {
    try {
        const { imageId } = req.body;  // 画像IDを取得

        if (!imageId) {
            return res.status(400).send("Invalid data.");
        }

        // 画像をデータベースから削除
        await pool.query(
            "DELETE FROM schema1.images WHERE id = $1 AND user_id = $2",
            [imageId, req.session.user.id]
        );

        res.redirect("/gallery");  // 削除後にギャラリーにリダイレクト
    } catch (err) {
        console.error("Error deleting image:", err);
        res.status(500).send("An error occurred while deleting the image.");
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
