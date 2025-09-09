import React, { useState, useEffect } from "react";
import { Container, Table, Button, Row, Col, Form, Modal, Alert } from "react-bootstrap";
import axios from "axios";
import toastr from "toastr";
import ConfirmationModal from "./ConfirmationModal";
import CustomPagination from "./CustomPagination";

const Siswa = () => {
  const [siswa, setSiswa] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalData, setTotalData] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [formData, setFormData] = useState({
    nama: "",
    nisn: "",
    foto: null,
  });
  const [editFormData, setEditFormData] = useState({
    nama: "",
    nisn: "",
    foto: null,
  });
  const [previewFoto, setPreviewFoto] = useState(null);
  const [editPreviewFoto, setEditPreviewFoto] = useState(null);
  const [error, setError] = useState("");
  const [imageErrors, setImageErrors] = useState({});

  // State untuk fitur revisi
  const [showConfirm, setShowConfirm] = useState(false);
  const [actionType, setActionType] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSiswa();
  }, [currentPage, limit, filterStatus]);

  const fetchSiswa = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:5000/api/siswa?page=${currentPage}&limit=${limit}`;

      // Tambahkan parameter status untuk filter
      if (filterStatus !== "all") {
        url += `&status=${filterStatus}`;
      }

      console.log("Fetching URL:", url);

      const response = await axios.get(url);
      setSiswa(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      setTotalData(response.data.pagination.total);

      console.log("Data received:", response.data.data.length, "items");
    } catch (error) {
      console.error("Error fetching siswa:", error);
      toastr.error("Gagal memuat data siswa");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk reset form tambah siswa
  const resetAddForm = () => {
    setFormData({ nama: "", nisn: "", foto: null });
    setPreviewFoto(null);
    setError("");
  };

  // Fungsi untuk reset form edit siswa
  const resetEditForm = () => {
    setEditFormData({ nama: "", nisn: "", foto: null });
    setEditPreviewFoto(null);
    setSelectedSiswa(null);
    setError("");
  };

  const showConfirmationModal = (siswa, type) => {
    setSelectedSiswa(siswa);
    setActionType(type);
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    try {
      if (actionType === "nonaktifkan") {
        await axios.patch(`http://localhost:5000/api/siswa/${selectedSiswa.id}/nonaktif`);
        toastr.success("Siswa berhasil dinonaktifkan");
      } else if (actionType === "aktifkan") {
        await axios.patch(`http://localhost:5000/api/siswa/${selectedSiswa.id}/aktif`);
        toastr.success("Siswa berhasil diaktifkan");
      }

      // Reset halaman ke 1 jika data di halaman saat ini menjadi kosong
      const newTotal = totalData + (actionType === "aktifkan" ? 1 : -1);
      const maxPage = Math.ceil(newTotal / limit);
      if (currentPage > maxPage && maxPage > 0) {
        setCurrentPage(1);
      } else {
        fetchSiswa();
      }
    } catch (error) {
      console.error(`Error ${actionType} siswa:`, error);
      toastr.error(`Gagal ${actionType} siswa`);
    } finally {
      setShowConfirm(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validasi nama maksimal 250 karakter
    if (formData.nama.length > 250) {
      toastr.error("Nama tidak boleh lebih dari 250 karakter");
      return;
    }

    // Validasi NISN
    if (!formData.nisn || formData.nisn.length !== 10) {
      toastr.error("NISN harus 10 digit angka");
      return;
    }

    // Validasi foto wajib
    if (!formData.foto) {
      toastr.error("Foto wajib diisi");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("nama", formData.nama);
      formDataToSend.append("nisn", formData.nisn);
      formDataToSend.append("foto", formData.foto);

      await axios.post("http://localhost:5000/api/siswa", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toastr.success("Siswa berhasil ditambahkan");
      setShowAddModal(false);
      resetAddForm();
      fetchSiswa();
    } catch (error) {
      console.error("Error adding siswa:", error);
      if (error.response && error.response.data && error.response.data.error) {
        toastr.error(error.response.data.error);
      } else {
        toastr.error("Gagal menambahkan siswa");
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validasi nama maksimal 250 karakter
    if (editFormData.nama.length > 250) {
      toastr.error("Nama tidak boleh lebih dari 250 karakter");
      return;
    }

    // Validasi NISN
    if (!editFormData.nisn || editFormData.nisn.length !== 10) {
      toastr.error("NISN harus 10 digit angka");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("nama", editFormData.nama);
      formDataToSend.append("nisn", editFormData.nisn);

      if (editFormData.foto) {
        formDataToSend.append("foto", editFormData.foto);
      } else {
        formDataToSend.append("existingFoto", selectedSiswa.foto);
      }

      await axios.put(`http://localhost:5000/api/siswa/${selectedSiswa.id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toastr.success("Siswa berhasil diupdate");
      setShowEditModal(false);
      resetEditForm();
      fetchSiswa();
    } catch (error) {
      console.error("Error updating siswa:", error);
      if (error.response && error.response.data && error.response.data.error) {
        toastr.error(error.response.data.error);
      } else {
        toastr.error("Gagal mengupdate siswa");
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi tipe file
      if (!file.type.startsWith("image/")) {
        toastr.error("Hanya file gambar yang diizinkan");
        return;
      }

      // Validasi ukuran file (maksimal 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toastr.error("Ukuran file maksimal 5MB");
        return;
      }

      setFormData({
        ...formData,
        foto: file,
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewFoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi tipe file
      if (!file.type.startsWith("image/")) {
        toastr.error("Hanya file gambar yang diizinkan");
        return;
      }

      // Validasi ukuran file (maksimal 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toastr.error("Ukuran file maksimal 5MB");
        return;
      }

      setEditFormData({
        ...editFormData,
        foto: file,
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPreviewFoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const openEditModal = (siswaItem) => {
    setSelectedSiswa(siswaItem);
    setEditFormData({
      nama: siswaItem.nama,
      nisn: siswaItem.nisn,
      foto: null,
    });
    setEditPreviewFoto(siswaItem.foto ? `http://localhost:5000/uploads/${siswaItem.foto}?t=${Date.now()}` : null);
    setShowEditModal(true);
  };

  const handleImageError = (siswaId, fileName) => {
    setImageErrors((prev) => ({ ...prev, [siswaId]: true }));
  };

  // Hitung data yang ditampilkan untuk pagination
  const showingStart = totalData > 0 ? (currentPage - 1) * limit + 1 : 0;
  const showingEnd = Math.min(currentPage * limit, totalData);

  return (
    <Container>
      <Row className="my-4">
        <Col>
          <h2>Daftar Siswa</h2>
        </Col>
        <Col className="text-end">
          <Button
            variant="primary"
            onClick={() => {
              resetAddForm(); // Reset form sebelum membuka modal
              setShowAddModal(true);
            }}
          >
            Tambah Siswa
          </Button>
        </Col>
      </Row>

      {/* Filter dan Limit Data */}
      <Row className="mb-3">
        <Col md={3}>
          <Form.Group>
            <Form.Label>Filter Status</Form.Label>
            <Form.Control
              as="select"
              value={filterStatus}
              onChange={(e) => {
                console.log("Filter changed to:", e.target.value);
                setFilterStatus(e.target.value);
                setCurrentPage(1); // Reset ke halaman pertama saat filter berubah
              }}
            >
              <option value="all">Semua Siswa</option>
              <option value="true">Siswa Aktif</option>
              <option value="false">Siswa Nonaktif</option>
            </Form.Control>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Data per Halaman</Form.Label>
            <Form.Control
              as="select"
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setCurrentPage(1); // Reset ke halaman pertama saat limit berubah
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </Form.Control>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>&nbsp;</Form.Label>
            <div>
              <Button variant="outline-secondary" onClick={() => fetchSiswa()} disabled={loading}>
                {loading ? "Memuat..." : "Refresh"}
              </Button>
            </div>
          </Form.Group>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Memuat data...</p>
        </div>
      ) : (
        <>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th>NISN</th>
                <th>Foto</th>
                <th>Tanggal Dibuat</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {siswa.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <div className="text-muted">{filterStatus === "all" ? "Belum ada data siswa" : `Belum ada siswa ${filterStatus === "true" ? "aktif" : "nonaktif"}`}</div>
                  </td>
                </tr>
              ) : (
                siswa.map((siswaItem, index) => {
                  const timestamp = new Date().getTime();
                  const imageUrl = `http://localhost:5000/uploads/${siswaItem.foto}?t=${timestamp}`;

                  return (
                    <tr key={siswaItem.id}>
                      <td>{(currentPage - 1) * limit + index + 1}</td>
                      <td>{siswaItem.nama}</td>
                      <td>{siswaItem.nisn}</td>
                      <td>
                        <div
                          style={{
                            width: "50px",
                            height: "50px",
                            borderRadius: "4px",
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#f0f0f0",
                            cursor: "pointer",
                            border: "1px solid #ddd",
                          }}
                          onClick={() => window.open(`http://localhost:5000/uploads/${siswaItem.foto}`, "_blank")}
                        >
                          {imageErrors[siswaItem.id] || !siswaItem.foto ? (
                            <div
                              style={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "bold",
                                color: "#666",
                                fontSize: "16px",
                                backgroundColor: "#e0e0e0",
                              }}
                            >
                              {siswaItem.nama ? siswaItem.nama.charAt(0).toUpperCase() : "S"}
                            </div>
                          ) : (
                            <img
                              src={imageUrl}
                              alt={siswaItem.nama}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                              onError={() => handleImageError(siswaItem.id, siswaItem.foto)}
                            />
                          )}
                        </div>
                      </td>
                      <td>
                        {siswaItem.created_date} {siswaItem.created_time}
                      </td>
                      <td>
                        <span className={`badge ${siswaItem.status ? "bg-success" : "bg-danger"}`}>{siswaItem.status ? "Aktif" : "Nonaktif"}</span>
                      </td>
                      <td>
                        {siswaItem.status ? (
                          <Button variant="danger" onClick={() => showConfirmationModal(siswaItem, "nonaktifkan")} className="me-2" size="sm">
                            Nonaktifkan
                          </Button>
                        ) : (
                          <Button variant="success" onClick={() => showConfirmationModal(siswaItem, "aktifkan")} className="me-2" size="sm">
                            Aktifkan
                          </Button>
                        )}
                        <Button variant="warning" onClick={() => openEditModal(siswaItem)} size="sm">
                          Edit
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>

          {/* Pagination dengan komponen custom - SELALU TAMPIL */}
          <CustomPagination
            currentPage={currentPage}
            totalPages={Math.max(1, totalPages)} // Minimal 1 halaman
            onPageChange={setCurrentPage}
            totalData={totalData}
            showingStart={showingStart}
            showingEnd={showingEnd}
            filterStatus={filterStatus} // Kirim status filter ke pagination
          />
        </>
      )}

      {/* Modal Konfirmasi */}
      <ConfirmationModal
        show={showConfirm}
        onHide={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        title={`Konfirmasi ${actionType === "nonaktifkan" ? "Nonaktifkan" : "Aktifkan"} Siswa`}
        message={`Apakah Anda yakin ingin ${actionType} siswa ${selectedSiswa?.nama}?`}
        variant={actionType === "nonaktifkan" ? "danger" : "success"}
      />

      {/* Modal Tambah Siswa */}
      <Modal
        show={showAddModal}
        onHide={() => {
          setShowAddModal(false);
          resetAddForm(); // Reset form saat modal ditutup
        }}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Tambah Siswa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>
                Nama <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={formData.nama}
                onChange={(e) => {
                  if (e.target.value.length <= 250) {
                    setFormData({ ...formData, nama: e.target.value });
                  } else {
                    toastr.error("Nama tidak boleh lebih dari 250 karakter");
                  }
                }}
                required
                maxLength={250}
                isInvalid={formData.nama.length > 250}
                placeholder="Masukkan nama lengkap siswa"
              />
              <Form.Text className="text-muted">{formData.nama.length}/250 karakter</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                NISN <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={formData.nisn}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ""); // Hanya angka
                  if (value.length <= 10) {
                    setFormData({ ...formData, nisn: value });
                  }
                }}
                required
                maxLength={10}
                placeholder="Masukkan NISN (10 digit angka)"
              />
              <Form.Text className="text-muted">{formData.nisn.length}/10 digit</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Foto <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handleFileChange} required />
              <Form.Text className="text-muted">Format: JPG, PNG, GIF. Maksimal 5MB.</Form.Text>
              {previewFoto && (
                <div className="mt-2">
                  <img
                    src={previewFoto}
                    alt="Preview"
                    style={{
                      width: "150px",
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                    }}
                  />
                </div>
              )}
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAddModal(false);
                  resetAddForm(); // Reset form saat tombol batal diklik
                }}
                className="me-2"
              >
                Batal
              </Button>
              <Button variant="primary" type="submit">
                Simpan
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal Edit Siswa */}
      <Modal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          resetEditForm(); // Reset form saat modal ditutup
        }}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Siswa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>
                Nama <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={editFormData.nama}
                onChange={(e) => {
                  if (e.target.value.length <= 250) {
                    setEditFormData({ ...editFormData, nama: e.target.value });
                  } else {
                    toastr.error("Nama tidak boleh lebih dari 250 karakter");
                  }
                }}
                required
                maxLength={250}
                isInvalid={editFormData.nama.length > 250}
                placeholder="Masukkan nama lengkap siswa"
              />
              <Form.Text className="text-muted">{editFormData.nama.length}/250 karakter</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                NISN <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={editFormData.nisn}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ""); // Hanya angka
                  if (value.length <= 10) {
                    setEditFormData({ ...editFormData, nisn: value });
                  }
                }}
                required
                maxLength={10}
                placeholder="Masukkan NISN (10 digit angka)"
              />
              <Form.Text className="text-muted">{editFormData.nisn.length}/10 digit</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Foto</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handleEditFileChange} />
              <Form.Text className="text-muted">Format: JPG, PNG, GIF. Maksimal 5MB. Kosongkan jika tidak ingin mengubah foto.</Form.Text>
              {editPreviewFoto && (
                <div className="mt-2">
                  <img
                    src={editPreviewFoto}
                    alt="Preview"
                    style={{
                      width: "150px",
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                    }}
                  />
                </div>
              )}
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowEditModal(false);
                  resetEditForm(); // Reset form saat tombol batal diklik
                }}
                className="me-2"
              >
                Batal
              </Button>
              <Button variant="primary" type="submit">
                Update
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Siswa;
