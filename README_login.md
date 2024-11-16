# ログイン画面作成メモ

### ログイン情報比較
・セッション管理: ログイン状態を維持したい場合は、express-session を使用する
```
npm install express-session
```
.jsファイルへ追記
```
const session = require("express-session");

// セッション設定
app.use(
    session({
        secret: "your_secret_key",
        resave: false,
        saveUninitialized: true,
    })
);
```

・パスワードの暗号化: 登録時にパスワードをハッシュ化し、ログイン時に bcrypt.compare で比較
```
npm install bcrypt
```

・環境変数: データベース接続情報や秘密鍵は .env ファイルに格納し、dotenv を使って管理します
```
npm install dotenv
```
.env ファイル例
```
DB_USER=yourusername     // PostgreSQL のユーザー名
DB_PASSWORD=yourpassword // PostgreSQL のパスワード
DB_HOST=localhost        // PostgreSQL のホスト名（通常は localhost）
DB_PORT=5432            // PostgreSQL のポート
DB_DATABASE=yourdatabase // 使用するデータベース名
SESSION_SECRET=your_secret_key
```
　※env ファイルを Git に含めない: .env ファイルは機密情報を含むため、Git リポジトリに含めないよう .gitignore に追記します。
```
echo ".env" >> .gitignore
```
　node.jsでの読み込み
　コード内で環境変数を使用するには、dotenv をインポートして設定をロードします。
　app.js に追加:
```
require("dotenv").config(); // .env ファイルをロード

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);
```

### ログインユーザ追加
1. テーブル作成
PostgreSQL にユーザー情報を保存するテーブルを作成します。
```
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- ハッシュ化されたパスワードを保存
    name VARCHAR(255) NOT NULL
);
```

2. ユーザー登録処理
ユーザー登録時にパスワードをハッシュ化して保存します。
.jsに追記
```
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

app.use(bodyParser.urlencoded({ extended: true }));

// ユーザー登録エンドポイント
app.post("/register", async (req, res) => {
    const { email, password, name } = req.body;

    try {
        // パスワードをハッシュ化
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // データベースに保存
        await pool.query(
            "INSERT INTO users (email, password, name) VALUES ($1, $2, $3)",
            [email, hashedPassword, name]
        );

        res.send("<h1>Registration successful!</h1><p><a href='/'>Go to login</a></p>");
    } catch (err) {
        console.error("Error during registration:", err);
        res.status(500).send("Internal server error");
    }
});

// サーバー起動
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
```

3. 動作確認
クライアントからのリクエスト: 登録フォームなどから以下のようなデータを送信します:
```
{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
}
```