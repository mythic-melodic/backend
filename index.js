import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import route from "./src/routes/index.js";
import cors from "cors";
import cron from "./src/cron/cronJob.js";
import path from 'path';
import { fileURLToPath } from "url";

// Tạo __filename và __dirname từ import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(cors());

app.use(bodyParser.json());
route(app);

app.use(express.static(path.join(__dirname, "dist")));

// Đường dẫn mặc định trả về index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log("Server is running on http://localhost:" + port);
});

export default app;
