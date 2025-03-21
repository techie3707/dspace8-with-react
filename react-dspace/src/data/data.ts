import { iconsImgs } from "../utils/images";

export interface NavigationLink {
    id: number;
    title: string;
    image?: string;
    path: string;
    collectionId?: string;
    submenu?: NavigationLink[];
}



export const siteConfig = {
    name: "EasySmartDocs",
    logo: "/assets/logo.png",
    apiEndpoint: "http://localhost:8080/server"
};




export const generateNavigationLinks = (
    collections: { id: string; name: string }[]
  ): NavigationLink[] => {
    return collections.map((collection, index) => ({
      id: index + 7,
      title: collection.name.charAt(0).toUpperCase() + collection.name.slice(1),
      image: iconsImgs.bills,
      path: `/collections/${collection.name.toLowerCase()}`,
      submenu: [
        {
          id: (index + 1) * 10 + 1,
          title: "Metadata Search",
          path: `/collections/${collection.name.toLowerCase()}/metadata-search`,
          collectionId: collection.id, 
        },
        {
          id: (index + 1) * 10 + 2,
          title: "Advanced Search",
          path: `/collections/${collection.name.toLowerCase()}/advanced-search`,
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
  




export const navigationLinks: NavigationLink[] = [
    { id: 1, title: "Home", image: iconsImgs.home, path: "/" },
    { id: 2, title: "User Management", image: iconsImgs.gears, path: "/UserManagement" },
    { id: 3, title: "Metadata Schemas", image: iconsImgs.gears, path: "/metadataSchemas" },
    { id: 4, title: "Groups", image: iconsImgs.gears, path: "/groups" },
    { id: 5, title: "Batch Import", image: iconsImgs.gears, path: "/batchImport" },
    { id: 6, title: "Admin Search", image: iconsImgs.gears, path: "/adminSearch" },
];


export const footerData = {
    companyName: "EasySmartDocs",
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
