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
import { CircleFadingPlus, Search } from "lucide-react";
import { getUserId } from "../../utilities/shared/userUtils";

const Tabs = () => {
  const [courses, setCourses] = useState([]);
  const [books, setBooks] = useState([]);
  const [showBook, setShowBook] = useState(false);
  const [tab, setTab] = useState("course");
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const userId = getUserId();

  // Reset pagination when tab changes
  useEffect(() => {
    setCurrentPage(1);
    // getAllCourses();
  }, [tab]);

  // Fetch data with pagination
  // Replace the fetch data function in the useEffect with this implementation:

  // const getAllCourses = async () => {
  //   try {
  //     const response = await apiService.get(`course-creator/getAllCourses`);

  //     if (response.data.length === 0) {
  //       navigate("/create");
  //       return;
  //     }
  //   } catch (error) {}
  // };

  // useEffect(() => {
  //   const fetchData = async () => {
  //     setLoading(true);
  //     try {
  //       // Add pagination params to API request
  //       const response = await apiService.get(
  //         `course-creator/getCourses/${tab}?page=${currentPage}&limit=${itemsPerPage}`
  //       );

  //       if (response.success) {
  //         const formattedCourses = response.data.map((course: any) => {
  //           const formatDate = (dateString: string) => {
  //             const options: Intl.DateTimeFormatOptions = {
  //               year: "numeric",
  //               month: "short",
  //               day: "2-digit",
  //             };
  //             return new Date(dateString).toLocaleDateString(
  //               undefined,
  //               options
  //             );
  //           };

  //           return {
  //             ID: course.course_id,
  //             "Course Title": course.course_title,
  //             Created: formatDate(course.createdAt),
  //             Updated: formatDate(course.updatedAt),
  //             Content: course.content,
  //             type: course.type,
  //           };
  //         });

  //         // Update state with formatted data and total count
  //         if (tab === "course") {
  //           setCourses(formattedCourses);
  //         } else {
  //           setBooks(formattedCourses);
  //         }

  //         // Set pagination info from the response
  //         if (response.pagination) {
  //           setTotalItems(response.pagination.totalItems);
  //           // Only update itemsPerPage if it differs from current state to avoid loops
  //           if (response.pagination.itemsPerPage !== itemsPerPage) {
  //             setItemsPerPage(response.pagination.itemsPerPage);
  //           }
  //           // Update current page if it differs from what we expect (defensive)
  //           if (response.pagination.currentPage !== currentPage) {
  //             setCurrentPage(response.pagination.currentPage);
  //           }
  //         }
  //       } else {
  //         console.error("API returned error:", response.message);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [tab, currentPage, itemsPerPage]);

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
        <button
          id="add-new-item"
          onClick={handleNavigate}
          className=" flex items-center justify-center text-white bg-gradient-to-tl font-medium rounded-md text-sm md:px-12 md:py-3 px-6 py-3 transition-all duration-200 shadow-sm"
        >
          <CircleFadingPlus className="mr-2" />
          Create
        </button>
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
            <Table
              headers={["Name", "Description", "Created At", "Updated At"]}
              data={courses}
              isAdd={false}
              addItem={addItem}
              deleteItem={deleteItem}
              setData={handleContentUpdate}
              downloadItem={(row: any) => downloadItem(row, setLoading)}
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
              deleteItem={deleteItem}
              setData={handleContentUpdate}
              downloadItem={(row: any) => downloadItem(row, setLoading)}
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
      </div>
    </div>
  );
};

export default Tabs;
