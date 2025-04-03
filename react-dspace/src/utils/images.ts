import alert from "../assets/icons/alert.svg";
import bell from "../assets/icons/bell.svg";
import bills from "../assets/icons/bills.svg";
import budget from "../assets/icons/budget.svg";
import card from "../assets/icons/card.svg";
import check from "../assets/icons/check.svg";
import empty_check from "../assets/icons/empty_check.svg";
import gears from "../assets/icons/gears.svg";
import home from "../assets/icons/home.svg";
import menu from "../assets/icons/menu.svg";
import plane from "../assets/icons/plane.svg";
import plus from "../assets/icons/plus.svg";
import report from "../assets/icons/report.svg";
import search from "../assets/icons/search.svg";
import user from "../assets/icons/user.svg";
import wallet from "../assets/icons/wallet.svg";
import wealth from "../assets/icons/wealth.svg";
import login from "../assets/icons/login.svg";
import edit from "../assets/icons/edit.png";
import remove from "../assets/icons/delete.png";
import access from "../assets/icons/access-control.png";
import person_one from "../assets/images/person_one.jpg";
import brand_one from "../assets/images/Final LogoESD.png";
import home_main from "../assets/images/homepage.svg";
import grid from "../assets/icons/grid.png";
import list from "../assets/icons/list.png";
import arrow from "../assets/icons/right-arrow.png";
import back_btn from "../assets/icons/back-button.png";


interface IconsImages {
    alert: string;
    bell: string;
    bills: string;
    budget: string;
    card: string;
    check: string;
    empty_check: string;
    gears: string;
    home: string;
    menu: string;
    plane: string;
    plus: string;
    report: string;
    search: string;
    user: string;
    wallet: string;
    wealth: string;
    login: string;
    edit: string;
    remove: string;
    access: string;
    list:   string;
    grid:   string;
    arrow:  string;
    back_btn:  string;
}


interface PersonsImages {
    person_one: string;
    brand_one: string;
    home_main: string;
}

// Export typed objects
export const iconsImgs: IconsImages = {
    alert, bell, bills, budget, card, check, empty_check, gears, home, menu, plane, plus, report, search, user, wallet, wealth, login, edit, remove, access, list, grid,arrow,back_btn
};

export const personsImgs: PersonsImages = {
    person_one, brand_one,home_main
};
