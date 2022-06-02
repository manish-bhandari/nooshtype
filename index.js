require("dotenv").config();
const express = require("express");

const app = express();

const path = require("path");

const FRONTEND_URI = process.env.FRONTEND_URI;
const PORT = 5001;

app.get("/", (req, res) => {
  const data = {
    name: "Manish Bhandari",
    isAwesome: true,
  };

  res.json(data);
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.resolve(__dirname, "./client/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Express app listening on http://localhost:${PORT}`);
});
