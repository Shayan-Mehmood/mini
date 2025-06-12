import { useEffect, useState } from "react";
import Table from "./Table";
import apiService from "../../utilities/service/api";
import {
  addItem,
  deleteItem,
  downloadItem,
  editItem,
} from "../../utilities/shared/tableUtils";
import { useNavigate } from "react-router";
import { CircleFadingPlus, FilePen, File, Search, FileType, FileText } from "lucide-react";
import { getUserId } from "../../utilities/shared/userUtils";
import Modal from "./Modal";

const Tabs = () => {
  const [courses, setCourses] = useState([]);
  const [books, setBooks] = useState([]);
  const [showBook, setShowBook] = useState(false);
  const [tab, setTab] = useState("course");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToDownload, setItemToDownload] = useState(null);
  const [isOpenDownloadAs, setIsOpenDownloadAs] = useState(false);
  const userId = getUserId();

  console.log(userId , ' User id?');

  // Reset pagination when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [tab]);


  // Handle tab change
  const handleTabChange = (newTab: string) => {
    setTab(newTab);
    setShowBook(newTab === "book");
  };

  // Handler for data updates
  const handleContentUpdate = (item: any) => {
    if (tab === "course") {
      setCourses(item);
    } else {
      setBooks(item);
    }
  };
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/create");
  };

  const fetchCourses = async (query: string) => {
    try {
      setLoading(true);

      // If query is empty, just fetch paginated courses normally
      if (!query) {
        const response = await apiService.get(
          `course-creator/getCourses/${tab}?page=${currentPage}&limit=${itemsPerPage}`
        );

        if (response.success) {
          const formattedCourses = response.data.map((course: any) => {
            const formatDate = (dateString: string) => {
              const options: Intl.DateTimeFormatOptions = {
                year: "numeric",
                month: "short",
                day: "2-digit",
              };
              return new Date(dateString).toLocaleDateString(
                undefined,
                options
              );
            };

            return {
              ID: course.course_id,
              "Course Title": course.course_title,
              Created: formatDate(course.createdAt),
              Updated: formatDate(course.updatedAt),
              Content: course.content,
              type: course.type,
            };
          });

          if (tab === "course") {
            setCourses(formattedCourses);
          } else {
            setBooks(formattedCourses);
          }

          if (response.pagination) {
            setTotalItems(response.pagination.totalItems);
            setItemsPerPage(response.pagination.itemsPerPage);
            setCurrentPage(response.pagination.currentPage);
          }
        }
        return;
      }

      // Otherwise, do a search
      const response = await apiService.get(
        `course-creator/search/${userId}?query=${encodeURIComponent(
          query
        )}&page=${currentPage}&limit=${itemsPerPage}`
      );

      const filteredItems = response.data.filter(
        (item: any) => item.type === tab
      );

      const formattedCourses = filteredItems.map((course: any) => {
        const formatDate = (dateString: string) => {
          const options: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "short",
            day: "2-digit",
          };
          return new Date(dateString).toLocaleDateString(undefined, options);
        };

        return {
          ID: course.course_id,
          "Course Title": course.course_title,
          Created: formatDate(course.createdAt),
          Updated: formatDate(course.updatedAt),
          Content: course.content,
          type: course.type,
        };
      });

      if (tab === "course") {
        setCourses(formattedCourses);
      } else {
        setBooks(formattedCourses);
      }

      if (response.pagination) {
        setTotalItems(response.pagination.totalItems);
        setItemsPerPage(response.pagination.itemsPerPage);
        setCurrentPage(response.pagination.currentPage);
      }
    } catch (error: any) {
      console.error("Error fetching courses:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (item: any,setCourses:any) => {
    setIsOpen(true);
    setItemToDelete(item);

  };

  const handleDownload = (row: any) => {
    setIsOpenDownloadAs(true);
    setItemToDownload(row);
  }

  // Optional: Add a debounce effect
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCourses(searchTerm);
    }, 1000); // Wait 500ms after user stops typing

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, tab, currentPage, itemsPerPage]);

  return (
    <div className="py-6">
      <div className="absolute md:right-7 right-1 md:mt-0 mt-5  mb-0 mr-5">
        {/* <button
          id="add-new-item"
          onClick={handleNavigate}
          className=" flex items-center justify-center text-white bg-gradient-to-tl font-medium rounded-md text-sm md:px-12 md:py-3 px-6 py-3 transition-all duration-200 shadow-sm"
        >
          <CircleFadingPlus className="mr-2" />
          Create
        </button> */}
      </div>
      <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 pt-6">
        <li className="me-2">
          <a
            id="course-tab"
            onClick={() => handleTabChange("course")}
            aria-current="page"
            className={
              !showBook
                ? "inline-block p-4 rounded-t-lg text-primary bg-gray-100 cursor-pointer"
                : "inline-block p-4 rounded-t-lg text-gray-500 bg-gray-50 cursor-pointer"
            }
          >
            Course
          </a>
        </li>
        <li className="me-2">
          <a
            id="book-tab"
            onClick={() => handleTabChange("book")}
            className={
              showBook
                ? "inline-block p-4 rounded-t-lg cursor-pointer text-primary bg-gray-100"
                : "inline-block p-4 rounded-t-lg cursor-pointer text-gray-500 bg-gray-50"
            }
          >
            Books
          </a>
        </li>
      </ul>
      <div id="data-table">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
          </div>
        ) : !showBook ? (
          <div className="flex flex-col gap-5">
            <div className="w-full md:w-1/2 mt-5">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-500" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full pl-10 p-2"
                  placeholder="Search by title or name..."
                />
              </div>
            </div>
            {/* need a modal to confirm deletion */}

            <Table
              headers={["Name", "Description", "Created At", "Updated At"]}
              data={courses}
              isAdd={false}
              addItem={addItem}
              deleteItem={handleDelete}
              setData={handleContentUpdate}
              downloadItem={(row: any) => handleDownload(row)}
              editItem={editItem}
              pre={"course-creator"}
              setLoading={setLoading}
              // Add pagination props
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="w-full md:w-1/2 mt-5">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-500" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full pl-10 p-2"
                  placeholder="Search by title or name..."
                />
              </div>
            </div>
            <Table
              headers={["Name", "Description", "Created At", "Updated At"]}
              data={books}
              isAdd={false}
              addItem={addItem}
              deleteItem={handleDelete}
              setData={handleContentUpdate}
              downloadItem={(row: any) => handleDownload(row)}
              editItem={editItem}
              pre={"book-creator"}
              setLoading={setLoading}
              // Add pagination props
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        )}

      <Modal
        maxWidth="max-w-xl"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Delete Course"
        children={<div className="flex flex-col gap-4">Are you sure you want to delete this course?
        <div className="flex justify-end gap-4">
          <button onClick={() => setIsOpen(false)} className="bg-gray-500 text-white px-4 py-2 rounded-md">Cancel</button>
          <button onClick={() =>{ deleteItem(itemToDelete, handleContentUpdate); setIsOpen(false);}} className="bg-red-500 text-white px-4 py-2 rounded-md">Delete</button>
        </div>
        </div>}
      />  
      <Modal
        maxWidth="max-w-xl"
        isOpen={isOpenDownloadAs}
        onClose={() => setIsOpenDownloadAs(false)}
        title="Download as"
        children={<div 
          className="flex flex-col gap-2"
        >
          <div className="flex gap-2">
          <button 
            onClick={() => {downloadItem(itemToDownload,setLoading,'pdf'); setIsOpenDownloadAs(false)}}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <FileType className="w-4 h-4 text-red-500" />
            Download as PDF
          </button>
          <button 
            onClick={() => {downloadItem(itemToDownload,setLoading,'docx'); setIsOpenDownloadAs(false)}}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-blue-500" />
            Download as Word
          </button>
          </div>
        </div>}
      />
      </div>
    </div>
  );
};

export default Tabs;
