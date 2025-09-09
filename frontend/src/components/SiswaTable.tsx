import React from 'react';
import { Table, Button, Badge, Image } from 'react-bootstrap';
import { Siswa } from '../types/Siswa';
import { siswaService } from '../services/siswaService';
interface SiswaTableProps {
  siswaList: Siswa[];
  onEdit: (siswa: Siswa) => void;
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
}
const SiswaTable: React.FC<SiswaTableProps> = ({ siswaList, onEdit, onDelete, onRestore }) => {
  const handlePreviewFoto = (fotoUrl: string) => {
    window.open(fotoUrl, '_blank');
  };
  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Foto</th>
          <th>Nama</th>
          <th>NISN</th>
          <th>Tanggal Dibuat</th>
          <th>Status</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        {siswaList.map((siswa) => (
          <tr key={siswa.id}>
            <td>
              <Image
                src={siswaService.getFotoUrl(siswa.foto)}
                alt={siswa.nama}
                thumbnail
                style={{ width: '50px', cursor: 'pointer' }}
                onClick={() => handlePreviewFoto(siswaService.getFotoUrl(siswa.foto))}
              />
            </td>
            <td>{siswa.nama}</td>
            <td>{siswa.nisn}</td>
            <td>{siswa.created_date} {siswa.created_time}</td>
            <td>
              <Badge bg={siswa.status ? 'success' : 'danger'}>
                {siswa.status ? 'Aktif' : 'Tidak Aktif'}
              </Badge>
            </td>
            <td>
              <Button
                variant="outline-primary"
                size="sm"
                className="me-2"
                onClick={() => onEdit(siswa)}
              >
                Edit
              </Button>
              {siswa.status ? (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => onDelete(siswa.id)}
                >
                  Delete
                </Button>
              ) : (
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => onRestore(siswa.id)}
                >
                  Restore
                </Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
export default SiswaTable;