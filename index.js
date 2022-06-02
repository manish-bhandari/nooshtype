require("dotenv").config();
const express = require("express");

const app = express();

const path = require("path");

const FRONTEND_URI = process.env.FRONTEND_URI;
const PORT = process.env.PORT || 6000;

app.use(express.static(path.resolve(__dirname, "./client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
});
app.listen(PORT, () => {
  console.log(`Express app listening`);
});
