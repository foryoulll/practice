const express = require('express');
const { Client } = require('pg');

const app = express();
const port = 3000;

// PostgreSQL クライアントの設定
const client = new Client({
  user: 'postgres',  // PostgreSQL のユーザー名
  host: 'localhost',     // PostgreSQL のホスト名（通常は localhost）
  database: 'postgres', // 使用するデータベース名
  password: 'postgres', // PostgreSQL のパスワード
  port: 5432,            // PostgreSQL のポート
});

// PostgreSQL に接続
client.connect();

// HTML ファイルを静的ファイルとして提供
app.use(express.static('public'));

// サンプルの GET エンドポイント（データベースから情報を取得）
app.get('/data', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM schema1.users');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

// サーバを起動
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
