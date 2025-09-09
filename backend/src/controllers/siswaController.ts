import { Request, Response } from "express";
import pool from "../config/database";
import fs from "fs";
import path from "path";

// Helper untuk format tanggal
const formatDate = (date: Date): { date: string; time: string } => {
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

// Get all siswa dengan pagination dan filter status
export const getSiswa = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string | undefined;
    const offset = (page - 1) * limit;

    let query = "SELECT * FROM siswa";
    let countQuery = "SELECT COUNT(*) FROM siswa";
    let queryParams: any[] = [];
    let paramCount = 0;

    // Filter berdasarkan status jika ada
    if (status !== undefined && status !== "all") {
      let statusBoolean: boolean;

      // Perbaikan: Hanya bandingkan dengan string karena status adalah string
      if (status === "true" || status === "1") {
        statusBoolean = true;
      } else if (status === "false" || status === "0") {
        statusBoolean = false;
      } else {
        console.log("Invalid status value:", status);
        res.status(400).json({ error: "Invalid status filter. Use 'true', 'false', or 'all'" });
        return;
      }

      paramCount++;
      query += ` WHERE status = $${paramCount}`;
      countQuery += ` WHERE status = $${paramCount}`;
      queryParams.push(statusBoolean);
    }

    // Tambahkan ORDER BY
    query += " ORDER BY created_at DESC";
    
    // Tambahkan LIMIT dan OFFSET dengan parameter yang benar
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    queryParams.push(limit);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    queryParams.push(offset);

    console.log("Final query:", query);
    console.log("Final query parameters:", queryParams);

    // Execute query untuk data
    const result = await pool.query(query, queryParams);

    // Execute query untuk count (tanpa LIMIT dan OFFSET)
    // Untuk count query, kita hanya butuh parameter filter (jika ada)
    const countParams = queryParams.slice(0, queryParams.length - 2); // Hapus limit dan offset
    console.log("Count query:", countQuery);
    console.log("Count parameters:", countParams);

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    // Format data
    const siswaData = result.rows.map((siswa: any) => {
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
  } catch (error) {
    console.error("Error fetching siswa:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all siswa nonaktif (masih dipertahankan untuk backward compatibility)
export const getNonaktifSiswa = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Query untuk data siswa yang nonaktif
    const result = await pool.query(
      "SELECT * FROM siswa WHERE status = false ORDER BY created_at DESC LIMIT $1 OFFSET $2", 
      [limit, offset]
    );

    // Query untuk total count yang nonaktif
    const countResult = await pool.query("SELECT COUNT(*) FROM siswa WHERE status = false");

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    // Format data yang dikembalikan
    const siswaData = result.rows.map((siswa: any) => {
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
  } catch (error) {
    console.error("Error fetching nonaktif siswa:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create new siswa dengan validasi yang lebih baik
export const createSiswa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nama, nisn } = req.body;

    // Validasi input
    if (!nama || nama.trim() === "") {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(400).json({ error: "Nama wajib diisi" });
      return;
    }

    if (!nisn || nisn.trim() === "") {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(400).json({ error: "NISN wajib diisi" });
      return;
    }

    // Validasi panjang nama (max 250 karakter)
    if (nama.length > 250) {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(400).json({ error: "Nama tidak boleh lebih dari 250 karakter" });
      return;
    }

    // Validasi foto wajib
    if (!req.file) {
      res.status(400).json({ error: "Foto wajib diisi" });
      return;
    }

    const foto = req.file.filename;
    console.log(`File uploaded: ${foto}, saved to: ${req.file.path}`);

    // Cek apakah NISN sudah terdaftar
    const checkResult = await pool.query("SELECT id FROM siswa WHERE nisn = $1", [nisn]);

    if (checkResult.rows.length > 0) {
      // Hapus file yang baru diupload karena NISN sudah ada
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(400).json({ error: "NISN sudah terdaftar" });
      return;
    }

    // Insert data ke database
    const result = await pool.query(
      `INSERT INTO siswa (nama, nisn, foto, status) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [nama.trim(), nisn.trim(), foto, true]
    );

    const newSiswa = result.rows[0];
    const { date, time } = formatDate(newSiswa.created_at);

    res.status(201).json({
      ...newSiswa,
      created_date: date,
      created_time: time,
    });
  } catch (error) {
    console.error("Error creating siswa:", error);
    // Hapus file yang sudah diupload jika terjadi error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update siswa
export const updateSiswa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nama, nisn } = req.body;

    // Validasi input
    if (!nama || nama.trim() === "") {
      res.status(400).json({ error: "Nama wajib diisi" });
      return;
    }

    if (!nisn || nisn.trim() === "") {
      res.status(400).json({ error: "NISN wajib diisi" });
      return;
    }

    // Validasi panjang nama
    if (nama.length > 250) {
      res.status(400).json({ error: "Nama tidak boleh lebih dari 250 karakter" });
      return;
    }

    // Dapatkan data siswa lama
    const oldResult = await pool.query("SELECT nisn, foto FROM siswa WHERE id = $1", [id]);
    if (oldResult.rows.length === 0) {
      res.status(404).json({ error: "Siswa tidak ditemukan" });
      return;
    }

    const oldSiswa = oldResult.rows[0];
    let foto = oldSiswa.foto;

    // Jika ada file baru diupload
    if (req.file) {
      // Hapus foto lama jika ada dan bukan default
      if (oldSiswa.foto && oldSiswa.foto !== "default.png") {
        const uploadsPath = path.resolve(process.env.UPLOAD_PATH || path.join(__dirname, "..", "..", "uploads"));
        const oldFotoPath = path.join(uploadsPath, oldSiswa.foto);
        if (fs.existsSync(oldFotoPath)) {
          fs.unlinkSync(oldFotoPath);
        }
      }

      foto = req.file.filename;
    }

    // Update database
    const result = await pool.query(
      `UPDATE siswa 
       SET nama = $1, nisn = $2, foto = $3, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4
       RETURNING *`,
      [nama.trim(), nisn.trim(), foto, id]
    );

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
  } catch (error) {
    console.error("Error updating siswa:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Soft delete siswa (set status to inactive)
export const deleteSiswa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE siswa 
       SET status = FALSE, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Siswa tidak ditemukan" });
      return;
    }

    res.json({ message: "Siswa berhasil dinonaktifkan" });
  } catch (error) {
    console.error("Error nonaktifkan siswa:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Restore siswa (set status to active)
export const restoreSiswa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE siswa 
       SET status = TRUE, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Siswa tidak ditemukan" });
      return;
    }

    res.json({ message: "Siswa berhasil diaktifkan kembali" });
  } catch (error) {
    console.error("Error mengaktifkan siswa:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get foto siswa
export const getFoto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename } = req.params;

    // Gunakan path yang absolut untuk folder uploads
    const uploadsPath = path.resolve(process.env.UPLOAD_PATH || path.join(__dirname, "..", "..", "uploads"));
    const filePath = path.join(uploadsPath, filename);

    console.log("Mencari file di:", filePath);

    // Cek jika file ada
    if (!fs.existsSync(filePath)) {
      console.log("File tidak ditemukan, menggunakan default");
      // Jika file tidak ditemukan, gunakan default
      const defaultPath = path.join(__dirname, "..", "..", "assets", "default.png");
      if (fs.existsSync(defaultPath)) {
        res.sendFile(defaultPath);
        return;
      } else {
        // Jika default juga tidak ada, kirim respons error
        res.status(404).json({ error: "File not found" });
        return;
      }
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error("Error getting foto:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};