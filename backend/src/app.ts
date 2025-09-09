import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import siswaRoutes from "./routes/siswaRoutes";
import path from "path";
import fs from "fs";

// Load environment variables
dotenv.config();

// Hanya satu deklarasi app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Menyajikan file statis dari folder 'uploads'
const uploadsDir = path.join(__dirname, "../uploads");
app.use("/uploads", express.static(uploadsDir));

// Buat folder uploads jika belum ada
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`Created uploads directory at: ${uploadsDir}`);
}

// Routes
app.use("/api/siswa", siswaRoutes);

// Default route
app.get("/", (req, res) => {
  res.json({ message: "Siswa API is running" });
});

// Setup server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Uploads directory: ${uploadsDir}`);
});
