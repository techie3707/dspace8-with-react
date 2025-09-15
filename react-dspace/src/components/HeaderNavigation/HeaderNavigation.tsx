import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  KeyboardArrowDown,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import {
  getNavigationLinks,
  NavigationLink,
} from "../../data/data";
import { fetchCollections } from "../../api/collection";
import { fetchUserGroupsList } from "../../api/accessManagement";
import { getAuthStatus } from "../../api/authApi";
import { useUserGroups } from "../../contexts/groupTypeContext";

const HeaderNavigation: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [navigationLinks, setNavigationLinks] = useState<NavigationLink[]>([]);
  const [activeLinkIdx, setActiveLinkIdx] = useState<number | null>(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const { groupCategories } = useUserGroups();

  useEffect(() => {
    checkAuth();
  }, []);

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

          const canRead =
            isAdminUser || groupNames.includes(`${groupNameBase}_Read`);
          const canUpload =
            isAdminUser || groupNames.includes(`${groupNameBase}_Upload`);
          const isCollectionAdmin =
            isAdminUser || groupNames.includes(`${groupNameBase}_Admin`);

          if (canRead || canUpload || isCollectionAdmin) {
            const submenu: NavigationLink[] = [];

            if (canRead || isCollectionAdmin || canUpload) {
              submenu.push({
                id: ((100 + index) + 1) * 10 + 1,
                title: "Metadata Search",
                path: `/adminSearch?page=0&size=10&sort=score%2CDESC&scope=${collection.id}`,
                collectionId: collection.id,
              });
            }

            if (isCollectionAdmin || isAdminUser) {
              submenu.splice(1, 0, {
                id: ((100 + index) + 1) * 10 + 2,
                title: "Advanced Search",
                path: `/advanceSearch?page=0&size=10&sort=score%2CDESC&scope=${collection.id}`,
                collectionId: collection.id,
              });
            }

            if (canUpload || isCollectionAdmin) {
              submenu.push({
                id: ((100 + index) + 1) * 10 + 3,
                title: "Create Item",
                path: `/collections/${collection.id}/create-item`,
                collectionId: collection.id,
              });
            }

            dynamicLinks.push({
              id: (100 + index) + 9,
              title: name.charAt(0).toUpperCase() + name.slice(1),
              path: basePath,
              submenu,
            });
          }
        });

        const baseLinks = getNavigationLinks(isAdminUser, groupCategories);

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
                  "Reports",
                  "Processes",
                ].includes(link.title)
            );

        const finalLinks = [...filteredLinks, ...dynamicLinks];
        setNavigationLinks(finalLinks);
      }
    } else {
      localStorage.removeItem("authToken");
      localStorage.removeItem("isAdmin");
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  };

  const handleNavigation = (id: number, path: string) => {
    setActiveLinkIdx(id);
    handleMenuClose();
    window.location.href = path;
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    linkId: number
  ) => {
    setAnchorEl(event.currentTarget);
    setOpenMenuId(linkId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setOpenMenuId(null);
  };

  const handleScroll = (direction: "left" | "right") => {
    const container = document.getElementById("nav-container");
    if (container) {
      const scrollAmount = 200;
      const newPosition =
        direction === "left"
          ? Math.max(0, scrollPosition - scrollAmount)
          : scrollPosition + scrollAmount;

      container.scrollTo({ left: newPosition, behavior: "smooth" });
      setScrollPosition(newPosition);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Paper
      elevation={1}
      sx={{
        position: "fixed",
        top: "90px",
        left: 0,
        right: 0,
        zIndex: 998,
        backgroundColor: "#f5f5f5",
        borderBottom: "1px solid #e0e0e0",
        padding: "8px 0",
        display: { xs: "none", sm: "none", md: "block" },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", position: "relative" }}>
        {/* Left Arrow */}
        <IconButton
          onClick={() => handleScroll("left")}
          sx={{
            position: "absolute",
            left: 8,
            zIndex: 1,
            backgroundColor: "#fff",
            "&:hover": {
              backgroundColor: "#fff",
            },
          }}
        >
          <ChevronLeft />
        </IconButton>

        {/* Navigation Container */}
        <Box
          id="nav-container"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            overflowX: "auto",
            scrollBehavior: "smooth",
            paddingX: "50px",
            "&::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
          }}
        >
          {navigationLinks.map((link) => (
            <Box key={link.id} sx={{ position: "relative", flexShrink: 0 }}>
              <Box
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (link.submenu) {
                    handleMenuOpen(e, link.id);
                  } else {
                    handleNavigation(link.id, link.path);
                  }
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  padding: "8px 16px",
                  borderRadius: "20px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s ease",
                  position: "relative",
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  "&:hover": {
                    background: "linear-gradient(to right, #1e4cf2, #63c19e)",
                    color: "#fff",
                  },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500, color: "inherit" }}
                >
                  {link.title}
                </Typography>
                {link.submenu && (
                  <KeyboardArrowDown
                    sx={{
                      transform:
                        openMenuId === link.id
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                      color: activeLinkIdx === link.id ? "#fff" : "#333",
                    }}
                  />
                )}
              </Box>

              {/* Submenu */}
              {link.submenu && (
                <Menu
                  anchorEl={anchorEl}
                  open={openMenuId === link.id}
                  onClose={handleMenuClose}
                  slotProps={{
                    paper: {
                      sx: {
                        minWidth: "220px",
                        mt: 1,
                        borderRadius: "8px",
                        boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
                        overflow: "hidden",
                      },
                    },
                  }}
                >
                  {link.submenu.map((subLink) => (
                    <MenuItem
                      key={subLink.id}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleNavigation(subLink.id, subLink.path);
                      }}
                      sx={{
                        padding: "12px 16px",
                        fontSize: "0.9rem",
                        fontWeight:
                          activeLinkIdx === subLink.id ? 600 : 500,
                        color:
                          activeLinkIdx === subLink.id ? "#fff" : "#333",
                        background:
                          activeLinkIdx === subLink.id
                            ? "linear-gradient(to right, #1e4cf2, #63c19e)"
                            : "transparent",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          background: "linear-gradient(to right, #1e4cf2, #63c19e)",
                          color: "#fff",
                        },
                      }}
                    >
                      {subLink.title}
                    </MenuItem>
                  ))}
                </Menu>
              )}
            </Box>
          ))}
        </Box>

        {/* Right Arrow */}
        <IconButton
          onClick={() => handleScroll("right")}
          sx={{
            position: "absolute",
            right: 8,
            zIndex: 1,
            backgroundColor: "#fff",
            "&:hover": {
              backgroundColor: "#fff",
            },
          }}
        >
          <ChevronRight />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default HeaderNavigation;
