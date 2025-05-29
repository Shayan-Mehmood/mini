import { useEffect } from "react";
import GettingStarted from "../../components/dashboard/GettingStarted"
import Tabs from "../../components/ui/tabs"
import { useDashboardTour } from "../../hooks/useDashboardTour";
import Header from "../../components/dashboard/Header";
import CourseSpotlight from "../../components/dashboard/CourseSpotlight";

const Dashboard = () => {
    const { startTour } = useDashboardTour();

   
    
    return (
        <>
        <div id="dashboard-getting-started">
            <Header />
            <GettingStarted 
                button={true} 
                title = "Welcome to Mini Lessons Academy!"
                description = "Build beautiful courses, automate your content, and turn your expertise into an ongoing learning experience."
                onTutorialClick={startTour}  
            />
        </div>
        
        <Tabs />

        <div className="py-5 ">
            <CourseSpotlight />
        </div>
        </>
    )
}

export default Dashboard