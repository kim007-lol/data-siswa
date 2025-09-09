import React, { useState, useEffect } from "react";
import { Container, Table, Button, Pagination, Alert } from "react-bootstrap";
import axios from "axios";

const NonaktifSiswa = () => {
  const [siswaNonaktif, setSiswaNonaktif] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalData, setTotalData] = useState(0);
  const [error, setError] = useState("");
  const [imageErrors, setImageErrors] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchSiswaNonaktif();
    // Reset error gambar setiap kali data dimuat ulang
    setImageErrors({});
  }, [currentPage, refreshTrigger]);

  const fetchSiswaNonaktif = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/siswa/nonaktif?page=${currentPage}`);
      setSiswaNonaktif(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      setTotalData(response.data.pagination.total);
    } catch (error) {
      console.error("Error fetching nonaktif siswa:", error);
      setError("Gagal memuat data siswa nonaktif");
    }
  };

  const handleAktifkan = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/siswa/${id}/aktif`);
      alert("Siswa berhasil diaktifkan kembali");

      // Trigger refresh dengan cara yang lebih efektif
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error mengaktifkan siswa:", error);
      alert("Gagal mengaktifkan siswa");
    }
  };

  const handleImageError = (e, siswa) => {
    // Sembunyikan gambar yang error
    e.target.style.display = "none";

    // Buat placeholder
    const parent = e.target.parentElement;
    if (!parent.querySelector(".avatar-placeholder")) {
      const placeholder = document.createElement("div");
      placeholder.className = "avatar-placeholder";
      placeholder.style.width = "40px";
      placeholder.style.height = "40px";
      placeholder.style.borderRadius = "50%";
      placeholder.style.backgroundColor = "#f0f0f0";
      placeholder.style.display = "flex";
      placeholder.style.alignItems = "center";
      placeholder.style.justifyContent = "center";
      placeholder.style.fontWeight = "bold";
      placeholder.style.color = "#666";
      placeholder.style.cursor = "pointer";
      placeholder.textContent = siswa.nama ? siswa.nama.charAt(0).toUpperCase() : "S";

      placeholder.onclick = () => {
        window.open(`http://localhost:5000/uploads/${siswa.foto}`, "_blank");
      };

      parent.appendChild(placeholder);
    }
  };

  return (
    <Container>
      <h2 className="my-4">Daftar Siswa Nonaktif</h2>
      <p>Total data: {totalData}</p>

      {error && <Alert variant="danger">{error}</Alert>}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>No</th>
            <th>Nama</th>
            <th>NISN</th>
            <th>Foto</th>
            <th>Tanggal Dibuat</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {siswaNonaktif.map((siswa, index) => (
            <tr key={siswa.id}>
              <td>{(currentPage - 1) * 10 + index + 1}</td>
              <td>{siswa.nama}</td>
              <td>{siswa.nisn}</td>
              <td>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f0f0f0",
                  }}
                >
                  <img
                    src={`http://localhost:5000/uploads/${siswa.foto}?t=${Date.now()}`}
                    alt={siswa.nama}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => handleImageError(e, siswa)}
                    onClick={() => window.open(`http://localhost:5000/uploads/${siswa.foto}`, "_blank")}
                  />
                </div>
              </td>
              <td>
                {siswa.created_date} {siswa.created_time}
              </td>
              <td>
                <Button variant="success" onClick={() => handleAktifkan(siswa.id)}>
                  Aktifkan
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {totalPages > 1 && (
        <Pagination>
          {Array.from({ length: totalPages }, (_, i) => (
            <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => setCurrentPage(i + 1)}>
              {i + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      )}
    </Container>
  );
};

export default NonaktifSiswa;
