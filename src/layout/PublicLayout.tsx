import { Outlet } from 'react-router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CallUsButton from '../components/ui/CallUsButton';

const PublicLayout = () => {
  return (
    <>
      {/* <Navbar /> */}
      <main>
        <Outlet />
      </main>
      {/* <Footer /> */}
      
      {/* Call Us Button - appears on all public pages */}
      <CallUsButton />
    </>
  );
};

export default PublicLayout;
