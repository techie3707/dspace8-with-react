import { iconsImgs } from "../../utils/images";
import { useNavigate } from "react-router-dom";
import { personsImgs } from "../../utils/images";
import "./ContentTop.css";
import { useContext, useState, useEffect } from "react";
import { SidebarContext } from "../../contexts/sidebarContext";
import { useAuth } from "../../contexts/AuthContext";
import { Menu, MenuItem } from "@mui/material";
import { logout } from "../../api/authApi";
import { showToast } from "../../contexts/ToastProvider";

const ContentTop: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const context = useContext(SidebarContext);
  const navigate = useNavigate();

  if (!context) {
    throw new Error("ContentTop must be used within a SidebarProvider");
  }

  const { toggleSidebar } = context;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/";
    } catch (error) {
      showToast("Logout failed. Please try again.", "error");
    }
    handleClose();
  };

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <div className="main-content-top">
      <div className="content-top-left">
        {isAuthenticated && (
          <button type="button" className="sidebar-toggler" onClick={toggleSidebar}>
            <img src={iconsImgs.menu} alt="Menu" />
          </button>
        )}
        <img className="brand-logo" src={personsImgs.brand_one} alt="profile" onClick={() => navigate("/")} />
      </div>
      <div className="content-top-btns">
         <button className="theme-toggle-btn content-top-btn" onClick={toggleTheme}>
          {darkMode ? "🌙" : "☀️"}
        </button>
        <button type="button" className="search-btn content-top-btn">
          <img src={iconsImgs.search} alt="Search" />
        </button>
        <button className="notification-btn content-top-btn">
          <img src={iconsImgs.bell} alt="Notifications" />
          <span className="notification-btn-dot"></span>
        </button>
       
        {isAuthenticated ? (
          <>
            <button className="profile-btn" onClick={handleClick}>
              <img src={personsImgs.person_one} alt="profile" className="profile-img" />
            </button>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <button className="login-btn content-top-btn" onClick={() => navigate("/login")}>
            <img src={iconsImgs.login} alt="Login" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ContentTop;
