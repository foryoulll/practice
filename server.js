const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// PostgreSQL クライアントの設定
const pool = new Pool({
  user: 'postgres',  // PostgreSQL のユーザー名
  host: 'localhost',     // PostgreSQL のホスト名（通常は localhost）
  database: 'postgres', // 使用するデータベース名
  password: 'postgres', // PostgreSQL のパスワード
  port: 5432,            // PostgreSQL のポート
});

app.use(express.json());
app.use(express.static("public")); // login.htmlを配置したディレクトリ

// POST /login エンドポイント
app.post("/login", async (req, res) => {
  const { email } = req.body;
  console.log("リクエスト受信:", email);  // 確認用ログ

  try {
      const query = "SELECT email FROM schema1.users WHERE email = $1";
      const result = await pool.query(query, [email]);

      console.log("クエリ結果:", result.rows);  // 確認用ログ
      
      if (result.rows.length > 0) {
          res.send("成功");
      } else {
          res.send("メールアドレスが見つかりませんでした");
      }
  } catch (error) {
      console.error("エラー:", error);
      res.status(500).send("サーバーエラーが発生しました");
  }
});


// サーバを起動
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

