// controllers/authController.js
const bcrypt = require("bcrypt");
const pool = require("../config/dbConfig");

// サインアップ処理
const signUp = async (req, res) => {
    const { email, password, name } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            "INSERT INTO schema1.users (email, password, name) VALUES ($1, $2, $3)",
            [email, hashedPassword, name]
        );
        res.redirect("/sign_in.html");
    } catch (err) {
        console.error("Error during sign up:", err);
        res.status(500).send("Error during sign up");
    }
};

// サインイン処理
const signIn = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query(
            "SELECT * FROM schema1.users WHERE email = $1",
            [email]
        );

        if (result.rows.length > 0) {
            const user = result.rows[0];
            const match = await bcrypt.compare(password, user.password);

            if (match) {
                req.session.user = user;
                res.redirect("/dashboard");
            } else {
                res.send("<h1>Invalid credentials</h1><p><a href='/sign_in.html'>Go back to sign in</a></p>");
            }
        } else {
            res.send("<h1>Invalid credentials</h1><p><a href='/sign_in.html'>Go back to sign in</a></p>");
        }
    } catch (err) {
        console.error("Error during sign in:", err);
        res.status(500).send("Internal server error");
    }
};

module.exports = {
    signUp,
    signIn,
};

