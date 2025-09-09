// Middleware validasi untuk siswa (TypeScript format)
import { Request, Response, NextFunction } from "express";

// Middleware validasi untuk siswa
export const validateSiswa = (req: Request, res: Response, next: NextFunction): void => {
  const { nama, nisn } = req.body;

  // Validasi nama
  if (!nama || nama.trim() === "") {
    res.status(400).json({ error: "Nama wajib diisi" });
    return;
  }

  if (nama.length > 250) {
    res.status(400).json({ error: "Nama tidak boleh lebih dari 250 karakter" });
    return;
  }

  // Validasi NISN
  if (!nisn || nisn.trim() === "") {
    res.status(400).json({ error: "NISN wajib diisi" });
    return;
  }

  // NISN harus 10 digit angka
  const nisnRegex = /^\d{10}$/;
  if (!nisnRegex.test(nisn)) {
    res.status(400).json({ error: "NISN harus berupa 10 digit angka" });
    return;
  }

  // Validasi nama hanya boleh huruf, spasi, titik, dan apostrophe
  const namaRegex = /^[a-zA-Z\s.']+$/;
  if (!namaRegex.test(nama)) {
    res.status(400).json({ error: "Nama hanya boleh mengandung huruf, spasi, titik, dan tanda petik" });
    return;
  }

  next();
};
