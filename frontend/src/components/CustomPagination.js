import React from "react";
import { Pagination } from "react-bootstrap";

const CustomPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalData,
  showingStart,
  showingEnd,
  filterStatus = "all", // Tambahkan prop untuk filter status
}) => {
  const maxVisiblePages = 5;

  // Pastikan minimal ada 1 halaman
  const safeCurrentPage = Math.max(1, currentPage);
  const safeTotalPages = Math.max(1, totalPages);

  // Hitung range halaman yang akan ditampilkan
  let startPage = Math.max(1, safeCurrentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(safeTotalPages, startPage + maxVisiblePages - 1);

  // Adjust startPage jika endPage tidak mencukupi maxVisiblePages
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  // Function untuk mendapatkan text filter
  const getFilterText = () => {
    if (filterStatus === "all") return "";
    return filterStatus === "true" ? " (Aktif)" : " (Nonaktif)";
  };

  return (
    <div className="d-flex justify-content-between align-items-center mt-4">
      {/* Total data di bagian kiri bawah dengan informasi filter */}
      <div className="text-muted">
        {totalData > 0 ? (
          <>
            Menampilkan <strong>{showingStart}</strong> sampai <strong>{showingEnd}</strong> dari <strong>{totalData}</strong> siswa{getFilterText()}
          </>
        ) : (
          <>Belum ada siswa{getFilterText()} untuk ditampilkan</>
        )}
      </div>

      {/* Pagination selalu ditampilkan */}
      <Pagination className="mb-0">
        {/* First Page */}
        <Pagination.First onClick={() => onPageChange(1)} disabled={safeCurrentPage === 1 || totalData === 0} title="Halaman pertama" />

        {/* Previous Page */}
        <Pagination.Prev onClick={() => onPageChange(safeCurrentPage - 1)} disabled={safeCurrentPage === 1 || totalData === 0} title="Halaman sebelumnya" />

        {/* Page Numbers - Selalu tampilkan minimal 1 halaman */}
        {totalData === 0 ? (
          <Pagination.Item active disabled>
            1
          </Pagination.Item>
        ) : (
          <>
            {startPage > 1 && safeTotalPages > maxVisiblePages && (
              <>
                <Pagination.Item onClick={() => onPageChange(1)}>1</Pagination.Item>
                {startPage > 2 && <Pagination.Ellipsis disabled />}
              </>
            )}

            {pages.map((page) => (
              <Pagination.Item key={page} active={page === safeCurrentPage} onClick={() => onPageChange(page)}>
                {page}
              </Pagination.Item>
            ))}

            {endPage < safeTotalPages && safeTotalPages > maxVisiblePages && (
              <>
                {endPage < safeTotalPages - 1 && <Pagination.Ellipsis disabled />}
                <Pagination.Item onClick={() => onPageChange(safeTotalPages)}>{safeTotalPages}</Pagination.Item>
              </>
            )}
          </>
        )}

        {/* Next Page */}
        <Pagination.Next onClick={() => onPageChange(safeCurrentPage + 1)} disabled={safeCurrentPage === safeTotalPages || totalData === 0} title="Halaman selanjutnya" />

        {/* Last Page */}
        <Pagination.Last onClick={() => onPageChange(safeTotalPages)} disabled={safeCurrentPage === safeTotalPages || totalData === 0} title="Halaman terakhir" />
      </Pagination>
    </div>
  );
};

export default CustomPagination;
