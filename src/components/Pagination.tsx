import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onNext: () => void;
  onPrev: () => void;
  totalCount: number;
  pageSize: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPrevPage,
  onNext,
  onPrev,
  totalCount,
  pageSize
}) => {
  // Generate page numbers to show (max 7 pages: 1 ... 4 5 6 ... 10)
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage <= 4) {
        // Show 1 2 3 4 5 ... last
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Show 1 ... (last-4) (last-3) (last-2) (last-1) last
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show 1 ... (current-1) current (current+1) ... last
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();
  
  // Calculate result range
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  if (totalPages <= 1) {
    return null; // Don't show pagination if only one page
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-ubuntu-grey-300">
      {/* Results info */}
      <div className="text-sm text-ubuntu-cool-600">
        Showing <span className="font-medium text-ubuntu-cool-500">{startItem}</span> to{' '}
        <span className="font-medium text-ubuntu-cool-500">{endItem}</span> of{' '}
        <span className="font-medium text-ubuntu-cool-500">{totalCount.toLocaleString()}</span> repositories
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          onClick={onPrev}
          disabled={!hasPrevPage}
          className={`
            flex items-center gap-1 px-3 py-2 text-sm rounded-md border transition-all duration-200
            ${hasPrevPage 
              ? 'border-ubuntu-grey-300 text-ubuntu-cool-600 hover:bg-ubuntu-grey-50 hover:border-ubuntu-grey-400 hover:shadow-sm hover:scale-105 cursor-pointer' 
              : 'border-ubuntu-grey-200 text-ubuntu-grey-400 cursor-not-allowed'
            }
          `}
          aria-label="Previous page"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {visiblePages.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-2 py-2 text-sm text-ubuntu-grey-500">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={`
                    px-3 py-2 text-sm rounded-md border transition-all duration-200 min-w-[2.5rem]
                    ${page === currentPage
                      ? 'border-ubuntu-orange-400 bg-ubuntu-orange-50 text-ubuntu-orange-700 font-medium shadow-sm cursor-default'
                      : 'border-ubuntu-grey-300 text-ubuntu-cool-600 hover:bg-ubuntu-grey-50 hover:border-ubuntu-grey-400 hover:shadow-sm hover:scale-105 cursor-pointer'
                    }
                  `}
                  aria-label={`Go to page ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={onNext}
          disabled={!hasNextPage}
          className={`
            flex items-center gap-1 px-3 py-2 text-sm rounded-md border transition-all duration-200
            ${hasNextPage 
              ? 'border-ubuntu-grey-300 text-ubuntu-cool-600 hover:bg-ubuntu-grey-50 hover:border-ubuntu-grey-400 hover:shadow-sm hover:scale-105 cursor-pointer' 
              : 'border-ubuntu-grey-200 text-ubuntu-grey-400 cursor-not-allowed'
            }
          `}
          aria-label="Next page"
        >
          Next
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Pagination; 