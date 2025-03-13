import { useEffect, useState, useContext } from "react";
import { personsImgs } from "../../utils/images";
import { navigationLinks } from "../../data/data";
import "./Sidebar.css";
import { SidebarContext } from "../../contexts/sidebarContext";
import { useNavigate } from "react-router-dom";
import { FaChevronDown, FaChevronRight } from "react-icons/fa"; // Import icons

const Sidebar: React.FC = () => {
  const [activeLinkIdx, setActiveLinkIdx] = useState<number | null>(1);
  const [openSubMenuIdx, setOpenSubMenuIdx] = useState<number | null>(null);
  const [sidebarClass, setSidebarClass] = useState("");
  const context = useContext(SidebarContext);
  const navigate = useNavigate();

  if (!context) {
    throw new Error("Sidebar must be used within a SidebarProvider");
  }

  const { isSidebarOpen } = context;

  useEffect(() => {
    setSidebarClass(isSidebarOpen ? "sidebar-change" : "");
  }, [isSidebarOpen]);

  const handleNavigation = (id: number, path: string) => {
    setActiveLinkIdx(id);
    navigate(path);
  };

  const toggleSubMenu = (id: number) => {
    setOpenSubMenuIdx(openSubMenuIdx === id ? null : id);
  };

  return (
    <div className={`sidebar ${sidebarClass}`}>
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
                  navigationLink.submenu
                    ? toggleSubMenu(navigationLink.id)
                    : handleNavigation(navigationLink.id, navigationLink.path);
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
