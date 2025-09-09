"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const siswaController_1 = require("../controllers/siswaController");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path_1.default.join(process.cwd(), "uploads");
        if (!fs_1.default.existsSync(uploadPath)) {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        try {
            const nisn = req.body.nisn;
            const ext = path_1.default.extname(file.originalname);
            if (!nisn || nisn.trim() === "") {
                const timestamp = Date.now();
                const filename = `${timestamp}_${file.originalname}`;
                return cb(null, filename);
            }
            const uploadPath = path_1.default.join(process.cwd(), "uploads");
            if (!fs_1.default.existsSync(uploadPath)) {
                fs_1.default.mkdirSync(uploadPath, { recursive: true });
                return cb(null, `${nisn}${ext}`);
            }
            fs_1.default.readdir(uploadPath, (err, files) => {
                if (err) {
                    console.error("Error reading upload directory:", err);
                    return cb(null, `${nisn}${ext}`);
                }
                if (files && files.length > 0) {
                    files.forEach((existingFile) => {
                        const existingBaseName = path_1.default.basename(existingFile, path_1.default.extname(existingFile));
                        if (existingBaseName === nisn) {
                            const filePath = path_1.default.join(uploadPath, existingFile);
                            fs_1.default.unlink(filePath, (unlinkErr) => {
                                if (unlinkErr) {
                                    console.error("Error deleting existing file:", unlinkErr);
                                }
                            });
                        }
                    });
                }
                cb(null, `${nisn}${ext}`);
            });
        }
        catch (error) {
            console.error("Error in filename function:", error);
            const fallbackName = `${Date.now()}_${file.originalname}`;
            cb(null, fallbackName);
        }
    },
});
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        }
        else {
            const error = new Error("Hanya file gambar yang diizinkan!");
            cb(error, false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});
router.get("/", siswaController_1.getSiswa);
router.get("/nonaktif", siswaController_1.getNonaktifSiswa);
router.post("/", upload.single("foto"), siswaController_1.createSiswa);
router.put("/:id", upload.single("foto"), siswaController_1.updateSiswa);
router.patch("/:id/nonaktif", siswaController_1.deleteSiswa);
router.patch("/:id/aktif", siswaController_1.restoreSiswa);
router.get("/foto/:filename", siswaController_1.getFoto);
exports.default = router;
//# sourceMappingURL=siswaRoutes.js.map