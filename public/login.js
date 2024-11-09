document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault(); // フォームのデフォルトの送信を防ぐ

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("error-message");

    // 入力検証
    if (!email || !password) {
        errorMessage.textContent = "メールアドレスとパスワードは必須です。";
        return;
    }

    // サーバーでの認証処理をここに追加（仮の処理）
    if (email === "user@example.com" && password === "password123") {
        alert("ログイン成功！");
        // 成功後、リダイレクトする場合（例: ダッシュボード画面に遷移）
        window.location.href = "dashboard.html"; // ここでリダイレクト先URLを設定
    } else {
        errorMessage.textContent = "メールアドレスまたはパスワードが間違っています。";
    }
});

