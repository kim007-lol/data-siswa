import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import { Siswa, PaginatedResponse } from '../types/Siswa';
import { siswaService } from '../services/siswaService';
import SiswaTable from './SiswaTable';
import SiswaForm from './SiswaForm';
import Pagination from './Pagination';
const SiswaList: React.FC = () => {
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editSiswa, setEditSiswa] = useState<Siswa | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const fetchSiswa = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response: PaginatedResponse = await siswaService.getSiswa(page);
      setSiswaList(response.data);
      setCurrentPage(response.pagination.page);
      setTotalPages(response.pagination.totalPages);
      setTotalData(response.pagination.total);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Gagal memuat data siswa');
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchSiswa();
  }, []);
  const handlePageChange = (page: number) => {
    fetchSiswa(page);
  };
  const handleShowForm = () => {
    setEditSiswa(null);
    setShowForm(true);
  };
  const handleHideForm = () => {
    setShowForm(false);
    setEditSiswa(null);
  };
  const handleSiswaUpdated = () => {
    fetchSiswa(currentPage);
  };
  const handleEdit = (siswa: Siswa) => {
    setEditSiswa(siswa);
    setShowForm(true);
  };
  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus siswa ini?')) {
      try {
        await siswaService.deleteSiswa(id);
        fetchSiswa(currentPage);
      } catch (error: any) {
        setError(error.response?.data?.error || 'Gagal menghapus siswa');
      }
    }
  };
  const handleRestore = async (id: number) => {
    try {
      await siswaService.restoreSiswa(id);
      fetchSiswa(currentPage);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Gagal memulihkan siswa');
    }
  };
  return (
    <Container fluid>
      <Row className="mt-3">
        <Col>
          <h2>Data Siswa</h2>
          <Button variant="primary" onClick={handleShowForm} className="mb-3">
            Tambah Siswa
          </Button>
          {error && <Alert variant="danger">{error}</Alert>}
          {isLoading ? (
            <p>Memuat data...</p>
          ) : (
            <>
              <SiswaTable
                siswaList={siswaList}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRestore={handleRestore}
              />
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  Menampilkan {siswaList.length} dari {totalData} data
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}
        </Col>
      </Row>
      <SiswaForm
        show={showForm}
        onHide={handleHideForm}
        onSiswaUpdated={handleSiswaUpdated}
        editSiswa={editSiswa}
      />
    </Container>
  );
};
export default SiswaList;