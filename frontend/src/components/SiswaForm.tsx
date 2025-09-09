import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { Siswa } from '../types/Siswa';
import { siswaService } from '../services/siswaService';
interface SiswaFormProps {
  show: boolean;
  onHide: () => void;
  onSiswaUpdated: () => void;
  editSiswa?: Siswa | null;
}
const SiswaForm: React.FC<SiswaFormProps> = ({ show, onHide, onSiswaUpdated, editSiswa }) => {
  const [nama, setNama] = useState('');
  const [nisn, setNisn] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (editSiswa) {
      setNama(editSiswa.nama);
      setNisn(editSiswa.nisn);
    } else {
      resetForm();
    }
  }, [editSiswa]);
  const resetForm = () => {
    setNama('');
    setNisn('');
    setFoto(null);
    setError('');
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    // Validasi
    if (!nama || !nisn) {
      setError('Nama dan NISN wajib diisi');
      setIsLoading(false);
      return;
    }
    const formData = new FormData();
    formData.append('nama', nama);
    formData.append('nisn', nisn);
    if (foto) {
      formData.append('foto', foto);
    }
    try {
      if (editSiswa) {
        await siswaService.updateSiswa(editSiswa.id, formData);
      } else {
        await siswaService.createSiswa(formData);
      }
      onSiswaUpdated();
      onHide();
      resetForm();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFoto(e.target.files[0]);
    }
  };
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{editSiswa ? 'Edit Siswa' : 'Tambah Siswa'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3">
            <Form.Label>Nama</Form.Label>
            <Form.Control
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Masukkan nama siswa"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>NISN</Form.Label>
            <Form.Control
              type="text"
              value={nisn}
              onChange={(e) => setNisn(e.target.value)}
              placeholder="Masukkan NISN!"
              required
              maxLength={10}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Foto</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {editSiswa && !foto && (
              <Form.Text className="text-muted">
                Biarkan kosong jika tidak ingin mengubah foto
              </Form.Text>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Batal
          </Button>
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? 'Menyimpan...' : (editSiswa ? 'Update' : 'Simpan')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
export default SiswaForm;