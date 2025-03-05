import { iconsImgs } from "../../utils/images";
import "./ContentTop.css";
import { useContext } from "react";
import { SidebarContext } from "../../contexts/sidebarContext";

const ContentTop: React.FC = () => {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error("ContentTop must be used within a SidebarProvider");
  }

  const { toggleSidebar } = context;

  return (
    <div className="main-content-top">
      <div className="content-top-left">
        <button type="button" className="sidebar-toggler" onClick={toggleSidebar}>
          <img src={iconsImgs.menu} alt="Menu" />
        </button>
        <h3 className="content-top-title">Home</h3>
      </div>
      <div className="content-top-btns">
        <button type="button" className="search-btn content-top-btn">
          <img src={iconsImgs.search} alt="Search" />
        </button>
        <button className="notification-btn content-top-btn">
          <img src={iconsImgs.bell} alt="Notifications" />
          <span className="notification-btn-dot"></span>
        </button>
      </div>
    </div>
  );
};

export default ContentTop;
