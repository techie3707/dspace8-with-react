import { useEffect, useState, useContext, useRef } from "react";
import { personsImgs } from "../../utils/images";
import { navigationLinks } from "../../data/data";
import "./Sidebar.css";
import { SidebarContext } from "../../contexts/sidebarContext";
import { useNavigate } from "react-router-dom";
import { FaChevronDown, FaChevronRight, FaTimes } from "react-icons/fa";

const Sidebar: React.FC = () => {
  const [activeLinkIdx, setActiveLinkIdx] = useState<number | null>(1);
  const [openSubMenuIdx, setOpenSubMenuIdx] = useState<number | null>(null);
  const context = useContext(SidebarContext);
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLDivElement>(null);

  if (!context) {
    throw new Error("Sidebar must be used within a SidebarProvider");
  }

  const { isSidebarOpen, toggleSidebar } = context;

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        toggleSidebar();
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen, toggleSidebar]);

  const handleNavigation = (id: number, path: string) => {
    setActiveLinkIdx(id);
    navigate(path);
    toggleSidebar(); // Close sidebar after navigation
  };

  const toggleSubMenu = (id: number) => {
    setOpenSubMenuIdx(openSubMenuIdx === id ? null : id);
  };

  return (
    <div className={`sidebar ${isSidebarOpen ? "" : "sidebar-change"}`} ref={sidebarRef}>
      {/* Close Button */}
      <button className="close-btn" onClick={toggleSidebar}>
        <FaTimes />
      </button>

      {/* User Info */}
      <div className="user-info">
        <div className="info-img img-fit-cover">
          <img src={personsImgs.person_one} alt="profile" />
        </div>
        <span className="info-name">Abhishek</span>
      </div>

      {/* Navigation */}
      <nav className="navigation">
        <ul className="nav-list">
          {navigationLinks.map((navigationLink) => (
            <li className="nav-item" key={navigationLink.id}>
              <a
                href="#"
                className={`nav-link ${navigationLink.id === activeLinkIdx ? "active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (navigationLink.submenu) {
                    toggleSubMenu(navigationLink.id);
                  } else {
                    handleNavigation(navigationLink.id, navigationLink.path);
                  }
                }}
              >
                <img src={navigationLink.image} className="nav-link-icon" alt={navigationLink.title} />
                <span className="nav-link-text">{navigationLink.title}</span>
                {navigationLink.submenu && (
                  <span className="submenu-toggle">
                    {openSubMenuIdx === navigationLink.id ? <FaChevronDown /> : <FaChevronRight />}
                  </span>
                )}
              </a>

              {/* Submenu */}
              {navigationLink.submenu && openSubMenuIdx === navigationLink.id && (
                <ul className="submenu">
                  {navigationLink.submenu.map((subLink) => (
                    <li key={subLink.id}>
                      <a
                        href="#"
                        className={`submenu-link ${subLink.id === activeLinkIdx ? "active" : ""}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleNavigation(subLink.id, subLink.path);
                        }}
                      >
                        {subLink.title}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
