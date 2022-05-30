import express from "express";
import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 5500;

app.use(express.json());

let refreshTokens = [];

app.post("/refreshtoken", (req, res) => {
  const refreshToken = req.body.token;
  if (!refreshToken) res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) res.sendStatus(403);
  jsonwebtoken.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    (err, data) => {
      console.log(err, data);
      if (err) res.sendStatus(403);
      const accessToken = jsonwebtoken.sign(
        { username: data.username },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "30s",
        }
      );
      res.json({ accessToken });
    }
  );
});

app.post("/login", (req, res) => {
  const data = req.body;
  const accessToken = jsonwebtoken.sign(data, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "30s",
  });
  const refreshToken = jsonwebtoken.sign(
    data,
    process.env.REFRESH_TOKEN_SECRET
  );
  refreshTokens.push(refreshToken);
  res.json({ accessToken, refreshToken });
});

app.post("/logout", (req, res) => {
  const refreshToken = req.body.token;
  refreshTokens = refreshTokens.filter((refToken) => refToken !== refreshToken);
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
