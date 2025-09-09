"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSiswa = void 0;
const validateSiswa = (req, res, next) => {
    const { nama, nisn } = req.body;
    if (!nama || nama.trim() === "") {
        res.status(400).json({ error: "Nama wajib diisi" });
        return;
    }
    if (nama.length > 250) {
        res.status(400).json({ error: "Nama tidak boleh lebih dari 250 karakter" });
        return;
    }
    if (!nisn || nisn.trim() === "") {
        res.status(400).json({ error: "NISN wajib diisi" });
        return;
    }
    const nisnRegex = /^\d{10}$/;
    if (!nisnRegex.test(nisn)) {
        res.status(400).json({ error: "NISN harus berupa 10 digit angka" });
        return;
    }
    const namaRegex = /^[a-zA-Z\s.']+$/;
    if (!namaRegex.test(nama)) {
        res.status(400).json({ error: "Nama hanya boleh mengandung huruf, spasi, titik, dan tanda petik" });
        return;
    }
    next();
};
exports.validateSiswa = validateSiswa;
//# sourceMappingURL=validation.js.map