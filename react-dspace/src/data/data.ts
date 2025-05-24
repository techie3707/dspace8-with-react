import { iconsImgs } from "../utils/images";
import type { Group, GroupCategories } from "../contexts/groupTypeContext";



export interface NavigationLink {
  id: number;
  title: string;
  image?: string;
  path: string;
  collectionId?: string;
  onClick?: () => void;
  submenu?: NavigationLink[];
}



export const siteConfig = {
  name: "TechBets",
  logo: "/assets/logo.png",
  apiEndpoint: "http://localhost:8080/server"
};




export const generateNavigationLinks = (
  collections: { id: string; name: string }[]
): NavigationLink[] => {
  return collections.map((collection, index) => ({
    id: index + 10,
    title: collection.name.charAt(0).toUpperCase() + collection.name.slice(1),
    image: iconsImgs.collectionname,
    path: `/collections/${collection.name.toLowerCase()}`,
    submenu: [
      {
        id: (index + 1) * 10 + 1,
        title: "Metadata Search",
        path: `/adminSearch?page=0&size=10&sort=score%2CDESC&scope=${collection.id}`,
        collectionId: collection.id,
      },
      {
        id: (index + 1) * 10 + 2,
        title: "Advanced Search",
        path: `/adminSearch?page=0&size=10&sort=score%2CDESC&scope=${collection.id}`,
        collectionId: collection.id,

      },
      {
        id: (index + 1) * 10 + 3,
        title: "Create Item",
        path: `/collections/${collection.id}/create-item`,
        collectionId: collection.id,
      },
    ],
  }));
};

export const getNavigationLinks = (
  isAdministrator: boolean,
  groupCategories: GroupCategories
): NavigationLink[] => {
  const links: NavigationLink[] = [
    { id: 1, title: "Home", image: iconsImgs.home, path: "/" },
    { id: 2, title: "User Management", image: iconsImgs.epople, path: "/UserManagement" },
    { id: 4, title: "Groups", image: iconsImgs.group, path: "/groups" },
    { id: 6, title: "Admin Search", image: iconsImgs.searchLight, path: "/adminSearch" },
    { id: 8, title: "systemInformation", image: iconsImgs.group, path: "/system-information" },
  ];

  const isUploadAdminGroup =
    groupCategories.upload.some((group: Group) =>
      group.name.toLowerCase().includes('upload')
    ) ||
    groupCategories.admin.some((group: Group) =>
      group.name.toLowerCase().includes('admin')
    );

  if (isAdministrator || isUploadAdminGroup) {
    links.splice(3, 0, {
      id: 5,
      title: "Batch Import",
      image: iconsImgs.batchimport,
      path: "/batchImport",
    });
  }

  if (isAdministrator) {
    links.splice(2, 0, {
      id: 3,
      title: "Metadata Schemas",
      image: iconsImgs.registries,
      path: "/metadataSchemas",
    });

    links.splice(links.length - 1, 0, {
      id: 7,
      title: "Edit Community",
      image: iconsImgs.whiteEditIcon,
      path: "/edit-Community-Collection",
    });
  }

  return links; 
};



export const footerData = {
  companyName: "TechBets",
  contacts: {
    phone: "+1 234 567 890",
    email: "info@example.com",
    address: "123 Main Street, City",
  },
  socialMedia: [
    { id: 1, title: "Facebook", link: "https://facebook.com" },
    { id: 2, title: "Twitter", link: "https://twitter.com" },
    { id: 3, title: "Instagram", link: "https://instagram.com" },
    { id: 4, title: "LinkedIn", link: "https://linkedin.com" },
  ],
  services: [
    { id: 1, title: "Web Development", path: "#" },
    { id: 2, title: "App Development", path: "#" },
    { id: 3, title: "SEO Optimization", path: "#" },
  ],
};
