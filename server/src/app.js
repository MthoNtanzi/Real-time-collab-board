const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

module.exports = app;