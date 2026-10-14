import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import SitePopups from "../components/SitePopups";

function MainLayout() {
  return (
    <div>
      <Navbar />
      <SitePopups />
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;