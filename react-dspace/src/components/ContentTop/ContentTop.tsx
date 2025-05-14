import { iconsImgs } from "../../utils/images";
import { useNavigate } from "react-router-dom";
import { personsImgs } from "../../utils/images";
import "./ContentTop.css";
import { useContext, useState, useEffect } from "react";
import { SidebarContext } from "../../contexts/sidebarContext";
import { useAuth } from "../../contexts/AuthContext";
import { Box, IconButton, InputAdornment, Menu, MenuItem, TextField } from "@mui/material";
import { getAuthStatus, logout } from "../../api/authApi";
import { showToast } from "../../contexts/ToastProvider";
import { getUserById } from "../../api/usermanagement";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from '@mui/icons-material/Close';

const ContentTop: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const context = useContext(SidebarContext);
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  if (!context) {
    throw new Error("ContentTop must be used within a SidebarProvider");
  }
  useEffect(() => {
    const fetchUUID = async () => {
      try {
        const uuid = await getAuthStatus();
        if (uuid) {
          setUserId(uuid);
        }
      } catch (error) {
        console.error("Error fetching UUID:", error);
      }
    };

    fetchUUID();
  }, []);
  const handleSearchClick = () => {
    if (!isSearchOpen) {
      setIsSearchOpen(true);
    } else {
      const trimmedQuery = searchQuery.trim();
      if (trimmedQuery) {
        const encodedQuery = encodeURIComponent(trimmedQuery);
        navigate(`/adminSearch?page=0&size=10&query=${encodedQuery}&sort=score%2CDESC`);
        setIsSearchOpen(false);
        setSearchQuery("");
      } else {
        setIsSearchOpen(false);
      }
    }
  };


  useEffect(() => {
    if (userId) {
      fetchUserData(userId);
    }
  }, [userId]);
  const toCamelCase = (name: string) => {
    return name
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const fetchUserData = async (id: string) => {
    try {
      const authToken = localStorage.getItem("authToken") || "";
      const user = await getUserById(id, authToken);
      const rawFirstName = user.metadata?.["eperson.firstname"]?.[0]?.value || "";
      const fName = toCamelCase(rawFirstName);
      setFirstName(fName);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };


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
  const handleCloseClick = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
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
      <Box display="flex" alignItems="center" gap={1}>
        <Box
          display="flex"
          alignItems="center"
          height={40}
          marginBottom={0} 
        >
          {isSearchOpen ? (
            <TextField
              className="main_search"
              variant="outlined"
              size="small"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchClick(); 
                }
              }}
              sx={{
                backgroundColor: 'white',
                borderRadius: 1,
                height: '100%',
                '& .MuiInputBase-root': {
                  height: '100%',
                  fontSize: 14,
                  paddingY: 0,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton
                      onClick={handleSearchClick}
                      edge="start"
                      sx={{ p: 0.5 }}
                    >
                      <SearchIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleCloseClick}
                      edge="end"
                      sx={{ p: 0.5 }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          ) : (
            <IconButton
              onClick={handleSearchClick}
              sx={{ height: '100%', p: 1 }}
            >
              <SearchIcon />
            </IconButton>
          )}
        </Box>
        {/* Added Navigation Links */}
        <Box display="flex" alignItems="center" gap={2}>
          <button className="nav-link-btn" onClick={() => navigate("/about")}>About Us</button>
          <button className="nav-link-btn" onClick={() => navigate("/contact")}>Contact Us</button>
        </Box>

        {isAuthenticated ? (
          <>
            <Box>
              <button className="profile-btn welcome-btn" onClick={handleClick}>
                Welcome! {firstName || "User"}
              </button>
              <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                <MenuItem
                  onClick={() => {
                    if (userId) {
                      navigate(`/userProfile/${userId}`);
                      handleClose();
                    } else {
                      showToast("User ID not available", "error");
                    }
                  }}
                >
                  View Profile
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    if (userId) {
                      navigate(`/userCart/${userId}`);
                      handleClose();
                    } else {
                      showToast("User ID not available", "error");
                    }
                  }}
                >
                  My List
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          </>
        ) : (
          <button className="login-btn content-top-btn" onClick={() => navigate("/login")}>
            Login
          </button>
        )}
      </Box>
    </div>
  );
};

export default ContentTop;
