// app.js
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const dotenv = require("dotenv");

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

// サーバー起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
