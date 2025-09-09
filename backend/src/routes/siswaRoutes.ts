import express from "express";
import { getSiswa, getNonaktifSiswa, createSiswa, updateSiswa, deleteSiswa, restoreSiswa, getFoto } from "../controllers/siswaController";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Konfigurasi multer untuk upload file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    try {
      const nisn = req.body.nisn;
      const ext = path.extname(file.originalname);

      if (!nisn || nisn.trim() === "") {
        const timestamp = Date.now();
        const filename = `${timestamp}_${file.originalname}`;
        return cb(null, filename);
      }

      const uploadPath = path.join(process.cwd(), "uploads");

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
        return cb(null, `${nisn}${ext}`);
      }

      fs.readdir(uploadPath, (err, files) => {
        if (err) {
          console.error("Error reading upload directory:", err);
          return cb(null, `${nisn}${ext}`);
        }

        if (files && files.length > 0) {
          files.forEach((existingFile) => {
            const existingBaseName = path.basename(existingFile, path.extname(existingFile));
            if (existingBaseName === nisn) {
              const filePath = path.join(uploadPath, existingFile);
              fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) {
                  console.error("Error deleting existing file:", unlinkErr);
                }
              });
            }
          });
        }

        cb(null, `${nisn}${ext}`);
      });
    } catch (error) {
      console.error("Error in filename function:", error);
      const fallbackName = `${Date.now()}_${file.originalname}`;
      cb(null, fallbackName);
    }
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      const error = new Error("Hanya file gambar yang diizinkan!");
      cb(error as any, false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Routes - TANPA VALIDASI MIDDLEWARE DULU
router.get("/", getSiswa);
router.get("/nonaktif", getNonaktifSiswa);
router.post("/", upload.single("foto"), createSiswa);
router.put("/:id", upload.single("foto"), updateSiswa);
router.patch("/:id/nonaktif", deleteSiswa);
router.patch("/:id/aktif", restoreSiswa);
router.get("/foto/:filename", getFoto);

export default router;
