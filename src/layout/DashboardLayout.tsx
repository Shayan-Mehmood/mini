import { Outlet } from "react-router";
import { useEffect } from "react";
import CallUsButton from "../components/ui/CallUsButton";

const DashboardLayout = () => {
  // Optional: Add animation for content entry
  useEffect(() => {
    const mainContent = document.querySelector('.dashboard-content');
    if (mainContent) {
      mainContent.classList.add('animate-fadeIn');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto ">
        <div className="dashboard-content rounded-xl bg-white shadow-sm sm:px-6 sm:py-0 ">
          <Outlet />
        </div>
      </div>
      
      {/* Call Us Button - appears on all dashboard pages */}
      <CallUsButton />
    </div>
  );
};

export default DashboardLayout;