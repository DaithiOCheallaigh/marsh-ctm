import React from 'react';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  resultsPerPage: number;
  onPageChange: (page: number) => void;
  onResultsPerPageChange: (count: number) => void;
  className?: string;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  resultsPerPage,
  onPageChange,
  className = ""
}) => {
  return (
    <div className={`relative w-full h-[39px] mt-4 ${className}`}>
      <div className="w-full h-px bg-[#C4C4C4]" />
      
      <div className="flex items-center gap-2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2.5 disabled:opacity-50"
        >
          <svg width="29" height="31" viewBox="0 0 29 31" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[26px] h-[30px]">
            <path d="M18.296 11.274C18.3656 11.2027 18.4203 11.1182 18.4569 11.0256C18.4936 10.9329 18.5113 10.8338 18.5092 10.7342C18.5071 10.6346 18.4852 10.5364 18.4447 10.4453C18.4043 10.3543 18.346 10.2722 18.2735 10.2039C18.2009 10.1356 18.1155 10.0825 18.0222 10.0475C17.9288 10.0126 17.8295 9.99666 17.7299 10.0006C17.6303 10.0045 17.5326 10.0282 17.4423 10.0704C17.352 10.1125 17.271 10.1722 17.204 10.246L13.204 14.496C13.0729 14.6348 12.9999 14.8185 12.9999 15.0095C12.9999 15.2004 13.0729 15.3841 13.204 15.523L17.204 19.773C17.271 19.8468 17.352 19.9065 17.4423 19.9486C17.5326 19.9908 17.6303 20.0145 17.7299 20.0184C17.8295 20.0223 17.9288 20.0063 18.0222 19.9714C18.1155 19.9365 18.2009 19.8834 18.2735 19.8151C18.346 19.7468 18.4043 19.6647 18.4447 19.5736C18.4852 19.4826 18.5071 19.3844 18.5092 19.2847C18.5113 19.1851 18.4936 19.0861 18.4569 18.9934C18.4203 18.9007 18.3656 18.8163 18.296 18.745L14.78 15.01L18.296 11.274ZM10.75 20.01C10.5511 20.01 10.3603 19.931 10.2197 19.7903C10.079 19.6497 10 19.4589 10 19.26L10 10.76C10 10.5611 10.079 10.3703 10.2197 10.2297C10.3603 10.089 10.5511 10.01 10.75 10.01C10.9489 10.01 11.1397 10.089 11.2803 10.2297C11.421 10.3703 11.5 10.5611 11.5 10.76L11.5 19.26C11.5 19.4589 11.421 19.6497 11.2803 19.7903C11.1397 19.931 10.9489 20.01 10.75 20.01Z" fill="#002C77"/>
          </svg>
        </button>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2.5 disabled:opacity-50"
        >
          <svg width="26" height="30" viewBox="0 0 26 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[26px] h-[30px]">
            <path d="M15.6355 19.7369C15.7185 19.6541 15.7844 19.5556 15.8293 19.4473C15.8742 19.339 15.8974 19.2228 15.8974 19.1055C15.8974 18.9882 15.8742 18.8721 15.8293 18.7637C15.7844 18.6554 15.7185 18.557 15.6355 18.4741L12.1606 14.9992L15.6355 11.5243C15.8029 11.3569 15.897 11.1297 15.897 10.8929C15.897 10.6561 15.8029 10.429 15.6355 10.2615C15.468 10.0941 15.2409 10 15.0041 10C14.7673 10 14.5401 10.0941 14.3727 10.2615L10.2619 14.3723C10.1789 14.4552 10.113 14.5536 10.0681 14.6619C10.0231 14.7703 10 14.8864 10 15.0037C10 15.121 10.0231 15.2371 10.0681 15.3455C10.113 15.4538 10.1789 15.5522 10.2619 15.6351L14.3727 19.7459C14.713 20.0862 15.2862 20.0862 15.6355 19.7369Z" fill="#002C77"/>
          </svg>
        </button>

        <span className="text-[#002C77] text-xs font-medium leading-6">Page</span>
        
        <div className="w-[41px] h-6 rounded flex items-center justify-center relative bg-[#E9E9E9]">
          <span className="text-[#002C77] text-xs font-medium leading-6">{currentPage}</span>
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-2 h-1.5 absolute right-1.5">
            <path fillRule="evenodd" clipRule="evenodd" d="M0 1.06667L0.998694 0L3.99477 3.2L6.99086 0L7.98955 1.06667L3.99477 5.33333L0 1.06667Z" fill="#002C77"/>
          </svg>
        </div>

        <span className="text-[#002C77] text-xs font-medium leading-6">of {totalPages}</span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2.5 disabled:opacity-50"
        >
          <svg width="26" height="30" viewBox="0 0 26 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[26px] h-[30px]">
            <path d="M10.2619 10.2631C10.1789 10.3459 10.113 10.4444 10.0681 10.5527C10.0231 10.661 10 10.7772 10 10.8945C10 11.0118 10.0231 11.1279 10.0681 11.2363C10.113 11.3446 10.1789 11.443 10.2619 11.5259L13.7368 15.0008L10.2619 18.4757C10.0945 18.6431 10.0004 18.8703 10.0004 19.1071C10.0004 19.3439 10.0945 19.571 10.2619 19.7385C10.4294 19.9059 10.6565 20 10.8933 20C11.1301 20 11.3572 19.9059 11.5247 19.7385L15.6355 15.6277C15.7185 15.5448 15.7844 15.4464 15.8293 15.3381C15.8742 15.2297 15.8974 15.1136 15.8974 14.9963C15.8974 14.879 15.8742 14.7629 15.8293 14.6545C15.7844 14.5462 15.7185 14.4478 15.6355 14.3649L11.5247 10.2541C11.1844 9.91381 10.6112 9.91381 10.2619 10.2631Z" fill="#002C77"/>
          </svg>
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2.5 disabled:opacity-50"
        >
          <svg width="29" height="31" viewBox="0 0 29 31" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[26px] h-[30px]">
            <path d="M10.2134 18.745C10.1438 18.8163 10.0891 18.9007 10.0525 18.9934C10.0158 19.0861 9.99807 19.1851 10.0002 19.2847C10.0023 19.3844 10.0242 19.4826 10.0647 19.5736C10.1051 19.6647 10.1634 19.7468 10.2359 19.8151C10.3085 19.8834 10.3939 19.9365 10.4872 19.9714C10.5806 20.0063 10.6799 20.0223 10.7795 20.0184C10.8791 20.0145 10.9768 19.9908 11.0671 19.9486C11.1574 19.9065 11.2384 19.8468 11.3054 19.773L15.3054 15.523C15.4365 15.3841 15.5095 15.2004 15.5095 15.0095C15.5095 14.8185 15.4365 14.6348 15.3054 14.496L11.3054 10.246C11.2384 10.1722 11.1574 10.1125 11.0671 10.0704C10.9768 10.0282 10.8791 10.0045 10.7795 10.0006C10.6799 9.99666 10.5806 10.0126 10.4872 10.0475C10.3939 10.0824 10.3085 10.1356 10.2359 10.2039C10.1634 10.2722 10.1051 10.3543 10.0647 10.4453C10.0242 10.5364 10.0023 10.6346 10.0002 10.7342C9.99807 10.8338 10.0158 10.9329 10.0525 11.0256C10.0891 11.1182 10.1438 11.2027 10.2134 11.274L13.7294 15.009L10.2134 18.745ZM17.7594 10.009C17.9583 10.009 18.1491 10.088 18.2897 10.2287C18.4304 10.3693 18.5094 10.5601 18.5094 10.759V19.259C18.5094 19.4579 18.4304 19.6487 18.2897 19.7893C18.1491 19.93 17.9583 20.009 17.7594 20.009C17.5605 20.009 17.3697 19.93 17.2291 19.7893C17.0884 19.6487 17.0094 19.4579 17.0094 19.259V10.759C17.0094 10.5601 17.0884 10.3693 17.2291 10.2287C17.3697 10.088 17.5605 10.009 17.7594 10.009Z" fill="#002C77"/>
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-2.5 absolute right-0 top-1/2 -translate-y-1/2">
        <span className="text-[#002C77] text-xs font-medium leading-6">Results per page</span>
        <div className="w-[50px] h-6 rounded flex items-center justify-center relative bg-[#E9E9E9]">
          <span className="text-[#002C77] text-xs font-medium leading-6">{resultsPerPage}</span>
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-2 h-1.5 absolute right-1.5">
            <path fillRule="evenodd" clipRule="evenodd" d="M0 1.06667L0.998694 0L3.99477 3.2L6.99086 0L7.98955 1.06667L3.99477 5.33333L0 1.06667Z" fill="#002C77"/>
          </svg>
        </div>
      </div>
    </div>
  );
};
