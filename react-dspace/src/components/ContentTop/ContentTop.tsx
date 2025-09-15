import { iconsImgs } from "../../utils/images";
import { useNavigate } from "react-router-dom";
import { personsImgs } from "../../utils/images";
import "./ContentTop.css";
import { useContext, useState, useEffect } from "react";
import { SidebarContext } from "../../contexts/sidebarContext";
import { useAuth } from "../../contexts/AuthContext";
import { Box, IconButton, InputAdornment, Menu, MenuItem, TextField, Drawer } from "@mui/material";
import { getAuthStatus, logout } from "../../api/authApi";
import { showToast } from "../../contexts/ToastProvider";
import { getUserById } from "../../api/usermanagement";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";

const ContentTop: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const context = useContext(SidebarContext);
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (!context) {
    throw new Error("ContentTop must be used within a SidebarProvider");
  }

  const { toggleSidebar } = context;

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
        setIsDrawerOpen(false);
      } else {
        setIsSearchOpen(false);
      }
    }
  };

  const handleCloseClick = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

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

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <div className="main-content-top flex items-center justify-between px-4 py-3 bg-white shadow-md">
      <div className="content-top-left flex items-center gap-3">
        {isAuthenticated && (
          <Box
            sx={{
              display: { xs: "block", sm: "block", md: "none" },
            }}
          >
            <button
              type="button"
              className="sidebar-toggler p-2 rounded-md hover:bg-gray-100 transition-colors"
              onClick={toggleSidebar}
            >
              <img src={iconsImgs.menu} alt="Menu" className="w-6 h-6" />
            </button>
          </Box>
        )}
        <img
          className="brand-logo w-10 h-10 cursor-pointer"
          src={personsImgs.brand_one}
          alt="profile"
          onClick={() => navigate("/")}
        />
      </div>
      <Box display="flex" alignItems="center" gap={2}>
        <Box display={{ xs: "none", md: "flex" }} alignItems="center" gap={2}>
          <Box display="flex" alignItems="center" height={40}>
            {isSearchOpen ? (
              <TextField
                className="main_search"
                variant="outlined"
                size="small"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchClick();
                  }
                }}
                sx={{
                  backgroundColor: "white",
                  borderRadius: 1,
                  height: "100%",
                  "& .MuiInputBase-root": {
                    height: "100%",
                    fontSize: 14,
                    paddingY: 0,
                    borderColor: "#D1D5DB",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#D1D5DB",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#9CA3AF",
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconButton
                        onClick={handleSearchClick}
                        edge="start"
                        sx={{ p: 0.5, color: "#4B5563" }}
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
                        sx={{ p: 0.5, color: "#4B5563" }}
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
                sx={{
                  height: "100%",
                  p: 1,
                  color: "#4B5563",
                  "&:hover": {
                    backgroundColor: "#E5E7EB",
                  },
                }}
              >
                <SearchIcon />
              </IconButton>
            )}
          </Box>
          <button className="nav-link-btn" onClick={() => navigate("/about")}>
            About Us
          </button>
          <button className="nav-link-btn" onClick={() => navigate("/contact")}>
            Contact Us
          </button>
          {isAuthenticated ? (
            <>
              <button
                className="profile-btn welcome-btn nav-link-btn"
                onClick={handleClick}
              >
                Welcome! {firstName || "User"}
              </button>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    bgcolor: "#FFFFFF",
                    color: "#1F2937",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    if (userId) {
                      navigate(`/userProfile/${userId}`);
                      handleClose();
                    } else {
                      showToast("User ID not available", "error");
                    }
                  }}
                  sx={{ "&:hover": { bgcolor: "#F3F4F6" } }}
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
                  sx={{ "&:hover": { bgcolor: "#F3F4F6" } }}
                >
                  My List
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    if (userId) {
                      navigate(`/WorkflowTask`);
                      handleClose();
                    } else {
                      showToast("User ID not available", "error");
                    }
                  }}
                  sx={{ "&:hover": { bgcolor: "#F3F4F6" } }}
                >
                  WorkflowTask
                </MenuItem>
                <MenuItem
                  onClick={handleLogout}
                  sx={{ "&:hover": { bgcolor: "#F3F4F6" } }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <button
              className="nav-link-btn login-btn"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          )}
        </Box>
        {/* Hamburger Menu for Mobile (< 768px) */}
        <Box display={{ xs: "flex", md: "none" }} alignItems="center">
          <IconButton
            onClick={toggleDrawer}
            sx={{
              color: "#1F2937",
              "&:hover": {
                backgroundColor: "#E5E7EB",
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Drawer for Mobile Menu */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={toggleDrawer}
        PaperProps={{
          sx: {
            backgroundColor: "#FFFFFF",
            color: "#1F2937",
            width: "75%",
            maxWidth: "300px",
            padding: 2,
          },
        }}
      >
        <Box display="flex" flexDirection="column" gap={2} p={2}>
          <IconButton
            onClick={toggleDrawer}
            sx={{ alignSelf: "flex-end", color: "#1F2937" }}
          >
            <CloseIcon />
          </IconButton>
          {isSearchOpen ? (
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchClick();
                }
              }}
              sx={{
                backgroundColor: "#FFFFFF",
                borderRadius: 1,
                "& .MuiInputBase-root": {
                  fontSize: 14,
                  paddingY: 0,
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#D1D5DB",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#9CA3AF",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton
                      onClick={handleSearchClick}
                      sx={{ p: 0.5, color: "#4B5563" }}
                    >
                      <SearchIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleCloseClick}
                      sx={{ p: 0.5, color: "#4B5563" }}
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
              sx={{
                color: "#4B5563",
                "&:hover": { backgroundColor: "#E5E7EB" },
              }}
            >
              <SearchIcon />
            </IconButton>
          )}
          <button
            className="nav-link-btn"
            onClick={() => {
              navigate("/about");
              toggleDrawer();
            }}
          >
            About Us
          </button>
          <button
            className="nav-link-btn"
            onClick={() => {
              navigate("/contact");
              toggleDrawer();
            }}
          >
            Contact Us
          </button>
          {isAuthenticated ? (
            <>
              <button
                className="nav-link-btn"
                onClick={() => {
                  if (userId) {
                    navigate(`/userProfile/${userId}`);
                    toggleDrawer();
                  } else {
                    showToast("User ID not available", "error");
                  }
                }}
              >
                View Profile
              </button>
              <button
                className="nav-link-btn"
                onClick={() => {
                  if (userId) {
                    navigate(`/userCart/${userId}`);
                    toggleDrawer();
                  } else {
                    showToast("User ID not available", "error");
                  }
                }}
              >
                My List
              </button>
              <button
                className="nav-link-btn"
                onClick={async () => {
                  try {
                    await logout();
                    window.location.href = "/";
                  } catch (error) {
                    showToast("Logout failed. Please try again.", "error");
                  }
                  toggleDrawer();
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              className="nav-link-btn login-btn"
              onClick={() => {
                navigate("/login");
                toggleDrawer();
              }}
            >
              Login
            </button>
          )}
        </Box>
      </Drawer>
    </div>
  );
};

export default ContentTop;
