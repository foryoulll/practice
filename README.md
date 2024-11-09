# practice

### 準備段階でやったこと<br>
・Node.js のインストール
　（やらなくてよかったかも）
```
sudo apt install nodejs
sudo apt install npm
```
・PostgreSQL クライアントのインストール<br>
　Node.js 用の PostgreSQL クライアントライブラリをインストールします。
```
npm install pg
```
・Express のインストール
　Express は Node.js 用の軽量な Web アプリケーションフレームワークです。
```
npm install express
```
### htmlとjs作成
サンプルコード（server.js）：
```
const express = require('express');
const { Client } = require('pg');

const app = express();
const port = 3000;

// PostgreSQL クライアントの設定
const client = new Client({
  user: 'yourusername',  // PostgreSQL のユーザー名
  host: 'localhost',     // PostgreSQL のホスト名（通常は localhost）
  database: 'yourdatabase', // 使用するデータベース名
  password: 'yourpassword', // PostgreSQL のパスワード
  port: 5432,            // PostgreSQL のポート
});

// PostgreSQL に接続
client.connect();

// HTML ファイルを静的ファイルとして提供
app.use(express.static('public'));

// サンプルの GET エンドポイント（データベースから情報を取得）
app.get('/data', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM your_table');
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
```

サンプル HTML ファイル（public/index.html）：
```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PostgreSQL Data</title>
</head>
<body>
    <h1>PostgreSQL から取得したデータ</h1>
    <ul id="data-list"></ul>

    <script>
        // サーバからデータを取得
        fetch('/data')
            .then(response => response.json())
            .then(data => {
                const dataList = document.getElementById('data-list');
                data.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item.name;  // ここでテーブルのカラムに合わせて表示
                    dataList.appendChild(li);
                });
            })
            .catch(error => console.error('Error:', error));
    </script>
</body>
</html>
```

### サーバの起動
上記のコードを保存した後、サーバを起動します。
```
node server.js
```
サーバが起動したら、ブラウザで 'http://localhost:3000' にアクセスして、PostgreSQL から取得したデータが表示されることを確認します。


### ディレクトリ
```
my-app/
├── node_modules/          # インストールされたモジュール
├── public/                # 静的ファイル（HTML, CSS, JS など）
│   ├── css/               # CSS ファイル
│   │   └── style.css      # スタイルシート
│   ├── js/                # JavaScript ファイル
│   │   └── input.js       # フォーム用 JavaScript
│   ├── index.html         # 入力フォーム用の HTML ファイル（例えば、登録フォーム）
│   ├── login.html         # ログインフォーム用の HTML ファイル
├── routes/                # API やルーティング関連のファイル
│   └── index.js           # ルート処理のエントリーポイント
├── views/                 # EJS や Pug などのテンプレートファイル（オプション）
├── app.js                 # Express アプリケーションのエントリーポイント
├── package.json           # パッケージの依存関係など
└── .gitignore             # Git の無視リスト
```



