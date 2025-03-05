import { iconsImgs } from "../utils/images";

interface NavigationLink {
    id: number;
    title: string;
    image: string;
    path: string;  // Added path
}

export const navigationLinks: NavigationLink[] = [
    { id: 1, title: 'Home', image: iconsImgs.home, path: '/' },
    { id: 2, title: 'Budget', image: iconsImgs.budget, path: '/about' },  
    { id: 3, title: 'Transactions', image: iconsImgs.plane, path: '/contact' },
    { id: 4, title: 'Subscriptions', image: iconsImgs.wallet, path: '/subscriptions' },
    { id: 5, title: 'Loans', image: iconsImgs.bills, path: '/loans' },
    { id: 6, title: 'Reports', image: iconsImgs.report, path: '/reports' },
    { id: 7, title: 'Savings', image: iconsImgs.wallet, path: '/savings' },
    { id: 8, title: 'Financial Advice', image: iconsImgs.wealth, path: '/advice' },
    { id: 9, title: 'Account', image: iconsImgs.user, path: '/account' },
    { id: 10, title: 'Settings', image: iconsImgs.gears, path: '/settings' }
];
