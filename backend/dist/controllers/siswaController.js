"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFoto = exports.restoreSiswa = exports.deleteSiswa = exports.updateSiswa = exports.createSiswa = exports.getNonaktifSiswa = exports.getSiswa = void 0;
const database_1 = __importDefault(require("../config/database"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const formatDate = (date) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return {
        date: `${day}/${month}/${year}`,
        time: `${hours}:${minutes}`,
    };
};
const getSiswa = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const offset = (page - 1) * limit;
        let query = "SELECT * FROM siswa";
        let countQuery = "SELECT COUNT(*) FROM siswa";
        let queryParams = [];
        let paramCount = 0;
        if (status !== undefined && status !== "all") {
            let statusBoolean;
            if (status === "true" || status === "1") {
                statusBoolean = true;
            }
            else if (status === "false" || status === "0") {
                statusBoolean = false;
            }
            else {
                console.log("Invalid status value:", status);
                res.status(400).json({ error: "Invalid status filter. Use 'true', 'false', or 'all'" });
                return;
            }
            paramCount++;
            query += ` WHERE status = $${paramCount}`;
            countQuery += ` WHERE status = $${paramCount}`;
            queryParams.push(statusBoolean);
        }
        query += " ORDER BY created_at DESC";
        paramCount++;
        query += ` LIMIT $${paramCount}`;
        queryParams.push(limit);
        paramCount++;
        query += ` OFFSET $${paramCount}`;
        queryParams.push(offset);
        console.log("Final query:", query);
        console.log("Final query parameters:", queryParams);
        const result = await database_1.default.query(query, queryParams);
        const countParams = queryParams.slice(0, queryParams.length - 2);
        console.log("Count query:", countQuery);
        console.log("Count parameters:", countParams);
        const countResult = await database_1.default.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(total / limit);
        const siswaData = result.rows.map((siswa) => {
            const { date, time } = formatDate(siswa.created_at);
            return {
                ...siswa,
                created_date: date,
                created_time: time,
            };
        });
        res.json({
            data: siswaData,
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
        });
    }
    catch (error) {
        console.error("Error fetching siswa:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getSiswa = getSiswa;
const getNonaktifSiswa = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const result = await database_1.default.query("SELECT * FROM siswa WHERE status = false ORDER BY created_at DESC LIMIT $1 OFFSET $2", [limit, offset]);
        const countResult = await database_1.default.query("SELECT COUNT(*) FROM siswa WHERE status = false");
        const total = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(total / limit);
        const siswaData = result.rows.map((siswa) => {
            const { date, time } = formatDate(siswa.created_at);
            return {
                ...siswa,
                created_date: date,
                created_time: time,
            };
        });
        res.json({
            data: siswaData,
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
        });
    }
    catch (error) {
        console.error("Error fetching nonaktif siswa:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getNonaktifSiswa = getNonaktifSiswa;
const createSiswa = async (req, res) => {
    try {
        const { nama, nisn } = req.body;
        if (!nama || nama.trim() === "") {
            if (req.file)
                fs_1.default.unlinkSync(req.file.path);
            res.status(400).json({ error: "Nama wajib diisi" });
            return;
        }
        if (!nisn || nisn.trim() === "") {
            if (req.file)
                fs_1.default.unlinkSync(req.file.path);
            res.status(400).json({ error: "NISN wajib diisi" });
            return;
        }
        if (nama.length > 250) {
            if (req.file)
                fs_1.default.unlinkSync(req.file.path);
            res.status(400).json({ error: "Nama tidak boleh lebih dari 250 karakter" });
            return;
        }
        if (!req.file) {
            res.status(400).json({ error: "Foto wajib diisi" });
            return;
        }
        const foto = req.file.filename;
        console.log(`File uploaded: ${foto}, saved to: ${req.file.path}`);
        const checkResult = await database_1.default.query("SELECT id FROM siswa WHERE nisn = $1", [nisn]);
        if (checkResult.rows.length > 0) {
            if (req.file) {
                fs_1.default.unlinkSync(req.file.path);
            }
            res.status(400).json({ error: "NISN sudah terdaftar" });
            return;
        }
        const result = await database_1.default.query(`INSERT INTO siswa (nama, nisn, foto, status) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`, [nama.trim(), nisn.trim(), foto, true]);
        const newSiswa = result.rows[0];
        const { date, time } = formatDate(newSiswa.created_at);
        res.status(201).json({
            ...newSiswa,
            created_date: date,
            created_time: time,
        });
    }
    catch (error) {
        console.error("Error creating siswa:", error);
        if (req.file) {
            fs_1.default.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.createSiswa = createSiswa;
const updateSiswa = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama, nisn } = req.body;
        if (!nama || nama.trim() === "") {
            res.status(400).json({ error: "Nama wajib diisi" });
            return;
        }
        if (!nisn || nisn.trim() === "") {
            res.status(400).json({ error: "NISN wajib diisi" });
            return;
        }
        if (nama.length > 250) {
            res.status(400).json({ error: "Nama tidak boleh lebih dari 250 karakter" });
            return;
        }
        const oldResult = await database_1.default.query("SELECT nisn, foto FROM siswa WHERE id = $1", [id]);
        if (oldResult.rows.length === 0) {
            res.status(404).json({ error: "Siswa tidak ditemukan" });
            return;
        }
        const oldSiswa = oldResult.rows[0];
        let foto = oldSiswa.foto;
        if (req.file) {
            if (oldSiswa.foto && oldSiswa.foto !== "default.png") {
                const uploadsPath = path_1.default.resolve(process.env.UPLOAD_PATH || path_1.default.join(__dirname, "..", "..", "uploads"));
                const oldFotoPath = path_1.default.join(uploadsPath, oldSiswa.foto);
                if (fs_1.default.existsSync(oldFotoPath)) {
                    fs_1.default.unlinkSync(oldFotoPath);
                }
            }
            foto = req.file.filename;
        }
        const result = await database_1.default.query(`UPDATE siswa 
       SET nama = $1, nisn = $2, foto = $3, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4
       RETURNING *`, [nama.trim(), nisn.trim(), foto, id]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: "Siswa tidak ditemukan" });
            return;
        }
        const updatedSiswa = result.rows[0];
        const { date, time } = formatDate(updatedSiswa.updated_at || updatedSiswa.created_at);
        res.json({
            ...updatedSiswa,
            updated_date: date,
            updated_time: time,
        });
    }
    catch (error) {
        console.error("Error updating siswa:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.updateSiswa = updateSiswa;
const deleteSiswa = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await database_1.default.query(`UPDATE siswa 
       SET status = FALSE, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`, [id]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: "Siswa tidak ditemukan" });
            return;
        }
        res.json({ message: "Siswa berhasil dinonaktifkan" });
    }
    catch (error) {
        console.error("Error nonaktifkan siswa:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.deleteSiswa = deleteSiswa;
const restoreSiswa = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await database_1.default.query(`UPDATE siswa 
       SET status = TRUE, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`, [id]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: "Siswa tidak ditemukan" });
            return;
        }
        res.json({ message: "Siswa berhasil diaktifkan kembali" });
    }
    catch (error) {
        console.error("Error mengaktifkan siswa:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.restoreSiswa = restoreSiswa;
const getFoto = async (req, res) => {
    try {
        const { filename } = req.params;
        const uploadsPath = path_1.default.resolve(process.env.UPLOAD_PATH || path_1.default.join(__dirname, "..", "..", "uploads"));
        const filePath = path_1.default.join(uploadsPath, filename);
        console.log("Mencari file di:", filePath);
        if (!fs_1.default.existsSync(filePath)) {
            console.log("File tidak ditemukan, menggunakan default");
            const defaultPath = path_1.default.join(__dirname, "..", "..", "assets", "default.png");
            if (fs_1.default.existsSync(defaultPath)) {
                res.sendFile(defaultPath);
                return;
            }
            else {
                res.status(404).json({ error: "File not found" });
                return;
            }
        }
        res.sendFile(filePath);
    }
    catch (error) {
        console.error("Error getting foto:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getFoto = getFoto;
//# sourceMappingURL=siswaController.js.map