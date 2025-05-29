import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ShareItem } from "../../utilities/shared/tableUtils";
import { 
  Search, 
  PlusCircle, 
  Edit, 
  Download, 
  Share2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  CalendarDays,
  Clock,
  FileText,
  ArrowUp,
  ArrowDown,
  ArrowUpDown
} from "lucide-react";
import apiService from "../../utilities/service/api";
import toast from "react-hot-toast";

// Add types for sorting
type SortField = 'created' | 'updated' | 'title' | null;
type SortDirection = 'asc' | 'desc';

interface TableProps {
  headers: string[];
  data: { [key: string]: string | number }[];
  isAdd: Boolean;
  addItem: CallableFunction;
  deleteItem: CallableFunction;
  downloadItem: CallableFunction;
  editItem: CallableFunction;
  setData: any;
  highlightedId?: string | null;
  pre: any;
  setLoading: any;
  // New pagination props
  totalItems?: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (limit: number) => void;
}

const Table = ({ 
  headers, 
  data, 
  addItem, 
  isAdd, 
  deleteItem, 
  downloadItem, 
  editItem, 
  setData, 
  highlightedId, 
  pre,
  setLoading,
  // Pagination props with defaults
  totalItems = 0,
  currentPage = 1,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange
}: TableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  // Add new state for sorting
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const navigate = useNavigate();

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  
  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending (newest first)
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Get relevant fields to display
  const getRelevantField = (item: any, fieldType: 'title' | 'created' | 'updated') => {
    const formatDate = (date: any) => {
      if (!date) return '';
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) return ''; // Invalid date
      return parsedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    };
  
    switch (fieldType) {
      case 'title':
        return item['Course Title'] || item['Book Title'] || item['Title'] || item['Name'] || item['Description'] || '';
      case 'created':
        return formatDate(item['Created'] || item['CreatedAt'] || item['Date Created']);
      case 'updated':
        return formatDate(item['Updated'] || item['UpdatedAt'] || item['Last Modified']);
      default:
        return '';
    }
  };
  
  // Get raw date value for sorting
  const getRawDateValue = (item: any, fieldType: 'created' | 'updated') => {
    let dateStr = '';
    
    switch (fieldType) {
      case 'created':
        dateStr = item['Created'] || item['CreatedAt'] || item['Date Created'] || '';
        break;
      case 'updated':
        dateStr = item['Updated'] || item['UpdatedAt'] || item['Last Modified'] || '';
        break;
    }
    
    if (!dateStr) return 0;
    
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 0 : date.getTime();
  };
  
  // Filter and sort data
  let processedData = searchTerm.trim() === "" 
    ? [...data] 
    : data.filter((item) => {
        const titleField = getRelevantField(item, 'title').toString().toLowerCase();
        const courseTitle = (item['Course Title'] || '').toString().toLowerCase();
        const bookTitle = (item['Book Title'] || '').toString().toLowerCase();
        const title = (item['Title'] || '').toString().toLowerCase();
        const name = (item['Name'] || '').toString().toLowerCase();
        const searchTermLower = searchTerm.toLowerCase();
        
        return titleField.includes(searchTermLower) || 
               courseTitle.includes(searchTermLower) || 
               bookTitle.includes(searchTermLower) ||
               title.includes(searchTermLower) ||
               name.includes(searchTermLower);
      });
  
  // Apply sorting if a sort field is selected
  if (sortField) {
    processedData.sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'title') {
        const aValue = getRelevantField(a, 'title').toString().toLowerCase();
        const bValue = getRelevantField(b, 'title').toString().toLowerCase();
        comparison = aValue.localeCompare(bValue);
      } else {
        // For date fields, use the raw timestamp for accurate sorting
        const aValue = getRawDateValue(a, sortField);
        const bValue = getRawDateValue(b, sortField);
        comparison = aValue - bValue;
      }
      
      // Reverse for descending order
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }
  
  const filteredData = processedData;

  // Handle row click to edit
  // const handleRowClick = (item: any) => {
  //   editItem(navigate, item, pre);
  // };
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };
  
  // Generate page numbers for pagination
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    
    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  // Get sort icon based on current sort state
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} className="ml-1 text-gray-400" />;
    }
    
    return sortDirection === 'asc' 
      ? <ArrowUp size={14} className="ml-1 text-purple-600" />
      : <ArrowDown size={14} className="ml-1 text-purple-600" />;
  };


  // Add this new function to handle Edit button clicks
const handleEditButtonClick = (item: any, e: React.MouseEvent) => {
  e.stopPropagation(); // Prevent row click handler from firing
  
  // Construct the same URL that editItem would use
  let url = '';
  if (pre) {
    url = `/dashboard/${pre}/edit/${item.ID}`;
  } else {
    url = `/edit/${item.ID}`;
  }
  
  // Open in a new tab
  navigate(url);
};

  return (
    <section className="w-full">
      <div className="w-full">
        {/* Main Content */}
        <div className="bg-white relative shadow-sm sm:rounded-lg overflow-hidden w-full p-2">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
            <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
              {isAdd && (
                <button
                  type="button"
                  className="flex items-center justify-center text-white bg-gradient-to-tl from-purple-600 to-purple-700 font-medium rounded-md text-sm px-4 py-2 transition-all duration-200 shadow-sm"
                  onClick={() => addItem(navigate)}
                >
                  <PlusCircle className="h-4 w-4 mr-1.5" />
                  Create New
                </button>
              )}
            </div>
          </div>
          
          {/* Table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[600px] text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                  {/* Title header */}
                  <th 
                    scope="col" 
                    className="px-4 py-3 font-semibold w-full cursor-pointer"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center">
                      Title
                      {getSortIcon('title')}
                    </div>
                  </th>
                  
                  {/* Created header - sortable */}
                  <th 
                    scope="col" 
                    className="px-4 py-3 font-semibold w-32 whitespace-nowrap cursor-pointer"
                    onClick={() => handleSort('created')}
                  >
                    <div className="flex items-center">
                      Created
                      {getSortIcon('created')}
                    </div>
                  </th>
                  
                  {/* Updated header - sortable */}
                  <th 
                    scope="col" 
                    className="px-4 py-3 font-semibold w-32 whitespace-nowrap cursor-pointer"
                    onClick={() => handleSort('updated')}
                  >
                    <div className="flex items-center">
                      Updated
                      {getSortIcon('updated')}
                    </div>
                  </th>
                  
                  <th scope="col" className="px-4 py-3 text-right font-semibold w-24 whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => {
                    return(
                    <tr 
                      key={index} 
                      className={`border-b border-gray-200 hover:bg-gray-50 transition-colors
                        ${item.ID == highlightedId ? 'bg-gray-50 border-l-4 border-l-purple-500' : ''}
                      `}
                    >
                      
                      {/* Title */}
                      <td 
                        className="px-4 py-3 font-medium text-gray-900 cursor-pointer w-full align-top"
                        // onClick={() => handleRowClick(item)}
                        onClick={(e) => handleEditButtonClick(item, e)} // Use the new function
                      >
                        <div className="flex items-center space-x-2 w-full">
                          <FileText size={16} className="text-gray-500 flex-shrink-0" />
                          <span className="hover:text-gray-700 transition-colors whitespace-normal flex-1">
                            {getRelevantField(item, 'title')}
                          </span>
                        </div>
                      </td>
                      
                      {/* Created Date */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center text-gray-500">
                          <CalendarDays size={14} className="mr-1.5 text-gray-400" />
                          {getRelevantField(item, 'created')}
                        </div>
                      </td>
                      
                      {/* Updated Date */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center text-gray-500">
                          <Clock size={14} className="mr-1.5 text-gray-400" />
                          {getRelevantField(item, 'updated')}
                        </div>
                      </td>
                      
                      {/* Action buttons - always visible */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
  onClick={(e) => handleEditButtonClick(item, e)}
                            className="p-1.5 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 shadow-sm transition-colors"
                            title="Edit"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => 
                            {
                              if(item.Content){
                                return downloadItem(item)
                              }else{
                                toast.error('Open this course in the editor to get Full Features.')
                              }
                            }
                            }
                            className={`p-1.5 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 shadow-sm transition-colors  `}
                            title="Download"
                          >
                            <Download size={15} />
                          </button>
                          <button
                            onClick={() => 
                            {
                              if(item.Content){
                                return ShareItem(navigate, item)
                              }else{
                                toast.error('Open this course in the editor to get Full Features.')
                              }

                            }
                            }
                            className={`p-1.5 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 shadow-sm transition-colors `}
                            title="Share"

                          >
                            <Share2 size={15} />
                          </button>
                          <button
                            onClick={() => deleteItem(item, setData)}
                            className="p-1.5 text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-red-500 rounded border border-gray-200 shadow-sm transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    )
})
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <Search size={28} className="text-gray-300 mb-2" />
                        <p>No content found. Try a different search or create a new item.</p>
                        {isAdd && (
                          <button
                            className="mt-4 flex items-center justify-center text-white bg-gradient-to-tl from-purple-600 to-purple-700 font-medium rounded-md text-sm px-4 py-2 transition-all duration-200 shadow-sm"
                            onClick={() => addItem(navigate)}
                          >
                            <PlusCircle className="h-4 w-4 mr-1.5" />
                            Create New
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Enhanced Pagination - update to use filteredData.length */}
          <nav
            className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4 border-t border-gray-200"
            aria-label="Table navigation"
          >
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-700">{filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> - 
                <span className="font-medium text-gray-700">{Math.min(currentPage * itemsPerPage, searchTerm ? filteredData.length : totalItems)}</span> of{" "}
                <span className="font-medium text-gray-700">{searchTerm ? filteredData.length : totalItems}</span> items
              </span>
              
              {onItemsPerPageChange && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-500">Items per page:</label>
                  <select 
                    className="bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-1 pr-8 focus:outline-none focus:ring-1 focus:ring-purple-500 appearance-none"
                    value={itemsPerPage}
                    onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                    style={{ minWidth: '70px' }}
                  >
                    {[5, 10, 25, 50].map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <ul className="inline-flex items-center -space-x-px">
              <li>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center h-8 px-3 text-gray-500 bg-white rounded-l-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <ChevronLeft size={16} />
                </button>
              </li>
              
              {getPageNumbers().map((page, index) => (
                <li key={index}>
                  {page === '...' ? (
                    <span className="flex items-center justify-center h-8 px-3 text-gray-500 bg-white border border-gray-300">
                      ...
                    </span>
                  ) : (
                    <button
                      onClick={() => handlePageChange(page as number)}
                      className={`flex items-center justify-center h-8 px-3 border border-gray-300 
                        ${currentPage === page 
                          ? 'text-white bg-purple-600 hover:bg-purple-700' 
                          : 'text-gray-500 bg-white hover:bg-gray-50'}`
                      }
                    >
                      {page}
                    </button>
                  )}
                </li>
              ))}
              
              <li>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center h-8 px-3 text-gray-500 bg-white rounded-r-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <ChevronRight size={16} />
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
};

export default Table;