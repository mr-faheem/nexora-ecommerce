import {
  Outlet,
} from "react-router-dom";

import Navbar from "../components/navbar/Navbar";
import Footer from "../components/footer/Footer";

import ScrollManager from "../components/common/ScrollManager";

function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollManager />

      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;