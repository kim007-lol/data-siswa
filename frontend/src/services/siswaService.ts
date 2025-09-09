import axios from 'axios';
import { Siswa, PaginatedResponse } from '../types/Siswa';
const API_BASE_URL = 'http://localhost:5000/api';
const api = axios.create({
  baseURL: API_BASE_URL,
});
export const siswaService = {
  // Get semua siswa dengan pagination
  getSiswa: (page: number = 1): Promise<PaginatedResponse> => {
    return api.get(`/siswa?page=${page}`).then((response) => response.data);
  },
  // Tambah siswa baru
  createSiswa: (formData: FormData): Promise<Siswa> => {
    return api.post('/siswa', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then((response) => response.data);
  },
  // Update siswa
  updateSiswa: (id: number, formData: FormData): Promise<Siswa> => {
    return api.put(`/siswa/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then((response) => response.data);
  },
  // Soft delete siswa
  deleteSiswa: (id: number): Promise<void> => {
    return api.delete(`/siswa/${id}`).then((response) => response.data);
  },
  // Restore siswa
  restoreSiswa: (id: number): Promise<void> => {
    return api.patch(`/siswa/${id}/restore`).then((response) => response.data);
  },
  // Get URL foto
  getFotoUrl: (filename: string): string => {
    return `${API_BASE_URL}/siswa/foto/${filename}`;
  },
};