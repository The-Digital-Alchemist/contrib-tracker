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
  // Generate page numbers to show (max 7 pages on desktop, 5 on mobile)
  const getVisiblePages = (isMobile = false) => {
    const maxPages = isMobile ? 5 : 7;
    const pages: (number | string)[] = [];
    
    if (totalPages <= maxPages) {
      // Show all pages if within limit
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      const showEndPages = isMobile ? 2 : 4;
      
      if (currentPage <= showEndPages) {
        // Show 1 2 3 4 ... last (or 1 2 3 ... last on mobile)
        for (let i = 2; i <= (isMobile ? 3 : 5); i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - (showEndPages - 1)) {
        // Show 1 ... (last-3) (last-2) (last-1) last (or fewer on mobile)
        pages.push('...');
        for (let i = totalPages - (isMobile ? 2 : 4); i <= totalPages; i++) {
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

  const visiblePagesDesktop = getVisiblePages(false);
  const visiblePagesMobile = getVisiblePages(true);
  
  // Calculate result range
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  if (totalPages <= 1) {
    return null; // Don't show pagination if only one page
  }

  return (
    <div className="flex flex-col items-center justify-between gap-4 pt-4 mt-6 border-t border-ubuntu-grey-300">
      {/* Results info */}
      <div className="w-full text-sm text-center text-ubuntu-cool-600 sm:text-left sm:w-auto">
        Showing <span className="font-medium text-ubuntu-cool-500">{startItem}</span> to{' '}
        <span className="font-medium text-ubuntu-cool-500">{endItem}</span> of{' '}
        <span className="font-medium text-ubuntu-cool-500">{totalCount.toLocaleString()}</span> repositories
      </div>

      {/* Mobile pagination controls - stacked layout */}
      <div className="flex flex-col w-full gap-3 sm:hidden">
        {/* Page info and navigation buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={onPrev}
            disabled={!hasPrevPage}
            className={`
              flex items-center gap-1 px-3 py-2 text-sm rounded-md border transition-all duration-200
              ${hasPrevPage 
                ? 'border-ubuntu-grey-300 text-ubuntu-cool-600 hover:bg-ubuntu-grey-50 hover:border-ubuntu-grey-400 hover:shadow-sm active:scale-95' 
                : 'border-ubuntu-grey-200 text-ubuntu-grey-400 cursor-not-allowed'
              }
            `}
            aria-label="Previous page"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Prev
          </button>

          <span className="text-sm font-medium text-ubuntu-cool-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={onNext}
            disabled={!hasNextPage}
            className={`
              flex items-center gap-1 px-3 py-2 text-sm rounded-md border transition-all duration-200
              ${hasNextPage 
                ? 'border-ubuntu-grey-300 text-ubuntu-cool-600 hover:bg-ubuntu-grey-50 hover:border-ubuntu-grey-400 hover:shadow-sm active:scale-95' 
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

        {/* Page numbers for mobile - more compactness */}
        <div className="flex flex-wrap items-center justify-center gap-1">
          {visiblePagesMobile.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-2 py-1 text-sm text-ubuntu-grey-500">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={`
                    px-2.5 py-1.5 text-sm rounded-md border transition-all duration-200 min-w-[2rem]
                    ${page === currentPage
                      ? 'border-ubuntu-orange-400 bg-ubuntu-orange-50 text-ubuntu-orange-700 font-medium shadow-sm cursor-default'
                      : 'border-ubuntu-grey-300 text-ubuntu-cool-600 hover:bg-ubuntu-grey-50 hover:border-ubuntu-grey-400 hover:shadow-sm active:scale-95'
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
      </div>

      {/* Desktop pagination controls - horizontal layout */}
      <div className="items-center justify-center hidden gap-2 sm:flex">
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
          {visiblePagesDesktop.map((page, index) => (
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