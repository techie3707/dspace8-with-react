import { useEffect, useState, useContext, useRef } from "react";
import { iconsImgs, personsImgs } from "../../utils/images";
import {
  getNavigationLinks,
  generateNavigationLinks,
  NavigationLink,
} from "../../data/data";
import { SidebarContext } from "../../contexts/sidebarContext";
import { useNavigate } from "react-router-dom";
import { FaChevronDown, FaChevronRight, FaTimes } from "react-icons/fa";
import "./Sidebar.css";
import { fetchCollections } from "../../api/collection";
import { fetchUserGroupsList } from "../../api/accessManagement";
import { getAuthStatus } from "../../api/authApi";

const Sidebar: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [navigationLinks, setNavigationLinks] = useState<NavigationLink[]>([]);
  const [activeLinkIdx, setActiveLinkIdx] = useState<number | null>(1);
  const [openSubMenuIdx, setOpenSubMenuIdx] = useState<number | null>(null);
  const context = useContext(SidebarContext);
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLDivElement>(null);

  if (!context) throw new Error("Sidebar must be used within a SidebarProvider");
  const { isSidebarOpen, toggleSidebar } = context;

  const checkAuth = async () => {
    const authToken = localStorage.getItem("authToken");
  
    if (authToken) {
      setIsAuthenticated(true);
  
      const userId = await getAuthStatus();
      if (userId) {
        const groupsData = await fetchUserGroupsList(userId);
        const groupNames = groupsData.groups.map((g: any) => g.name);
  
        const isAdminUser = groupNames.includes("Administrator");
        setIsAdmin(isAdminUser);
        localStorage.setItem("isAdmin", JSON.stringify(isAdminUser));
  
        const collections = await fetchCollections();
        const dynamicLinks: NavigationLink[] = [];
  
        collections.forEach((collection, index) => {
          const name = collection.name;
          const basePath = `/collections/${name.toLowerCase()}`;
          const groupNameBase = name.replace(/\s+/g, "");
  
          const canRead = isAdminUser || groupNames.includes(`${groupNameBase}_Read`);
          const canUpload = isAdminUser || groupNames.includes(`${groupNameBase}_Upload`);
          const isCollectionAdmin = isAdminUser || groupNames.includes(`${groupNameBase}_Admin`);
  
          if (canRead || canUpload || isCollectionAdmin) {
            const submenu: NavigationLink[] = [];
  
            if (canRead || isCollectionAdmin || canUpload) {
              submenu.push({
                id: ((100+index) + 1) * 10 + 1,
                title: "Metadata Search",
                path: `/adminSearch?page=0&size=10&sort=score%2CDESC&scope=${collection.id}`,
                collectionId: collection.id,
              });
            }
  
            if (canUpload || isCollectionAdmin) {
              submenu.push({
                id: ((100+index) + 1) * 10 + 3,
                title: "Create Item",
                path: `/collections/${collection.id}/create-item`,
                collectionId: collection.id,
              });
            }
  
            if (isCollectionAdmin || isAdminUser) {
              submenu.splice(1, 0, {
                id: ((100+index) + 1) * 10 + 2,
                title: "Advanced Search",
                path: `/advanceSearch?page=0&size=10&sort=score%2CDESC&scope=${collection.id}`,
                collectionId: collection.id,
              });
            }
  
            dynamicLinks.push({
              id: (100+index) + 9,
              title: name.charAt(0).toUpperCase() + name.slice(1),
              image: iconsImgs.collectionname,
              path: basePath,
              submenu,
            });
          }
        });
  
        const baseLinks = getNavigationLinks(isAdminUser);
        const filteredLinks = isAdminUser
          ? baseLinks
          : baseLinks.filter(
              (link) =>
                ![
                  "User Management",
                  "Groups",
                  "Admin Search",
                  "Create Community",
                  "Create Collection",
                ].includes(link.title)
            );
  
        setNavigationLinks([...filteredLinks, ...dynamicLinks]);
      }
    } else {
      localStorage.removeItem("authToken");
      localStorage.removeItem("isAdmin");
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  };
  
  useEffect(() => {
    checkAuth();
  }, [isSidebarOpen]);

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
    window.location.href = path;
    toggleSidebar();
  };

  const toggleSubMenu = (id: number) => {
    setOpenSubMenuIdx(openSubMenuIdx === id ? null : id);
  };

  return (
    <div className={`sidebar ${isSidebarOpen ? "" : "sidebar-change"}`} ref={sidebarRef}>
      <button className="close-btn" onClick={toggleSidebar}>
        <FaTimes />
      </button>

      <div className="user-info">
        <div className="info-img img-fit-cover">
          <img src={personsImgs.person_one} alt="profile" />
        </div>
        <span className="info-name">Abhishek</span>
      </div>

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
                <img
                  src={navigationLink.image}
                  className="nav-link-icon"
                  alt={navigationLink.title}
                />
                <span className="nav-link-text">{navigationLink.title}</span>
                {navigationLink.submenu && (
                  <span className="submenu-toggle">
                    {openSubMenuIdx === navigationLink.id ? <FaChevronDown /> : <FaChevronRight />}
                  </span>
                )}
              </a>

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
