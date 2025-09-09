export interface Siswa {
  id?: number;
  nama: string;
  nisn: string;
  foto: string;
  created_at?: Date;
  updated_at?: Date;
  status: boolean;
}

export interface SiswaCreateRequest {
  nama: string;
  nisn: string;
  foto: string;
}