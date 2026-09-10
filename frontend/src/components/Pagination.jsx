import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, totalItems, pageSize, onPageChange }) {
  if (totalItems === 0) return null;
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="paginationBar">
      <span>
        Showing <b>{startItem}</b> to <b>{endItem}</b> of <b>{totalItems}</b> entries
      </span>

      <div className="paginationControls">
        <button 
          disabled={currentPage === 1} 
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft size={14} /> Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button 
            key={p} 
            className={p === currentPage ? 'active' : ''} 
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}
        <button 
          disabled={currentPage === totalPages || totalPages === 0} 
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
