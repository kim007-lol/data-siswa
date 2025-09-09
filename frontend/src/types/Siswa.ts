export interface Siswa {
  id: number;
  nama: string;
  nisn: string;
  foto: string;
  created_at: string;
  updated_at: string;
  status: boolean;
  created_date?: string;
  created_time?: string;
}
export interface PaginatedResponse {
  data: Siswa[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}