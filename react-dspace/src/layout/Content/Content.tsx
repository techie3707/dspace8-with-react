import { useLocation } from "react-router-dom";
import "./Content.css";
import ContentTop from '../../components/ContentTop/ContentTop';
import ContentMain from '../../components/ContentMain/ContentMain';
import ContentBottom from "../../components/ContentBottom/ContentBottom";
import HeaderNavigation from "../../components/HeaderNavigation/HeaderNavigation";


const Content: React.FC = () => {
  const location = useLocation();
  const hideHeaderFooter = location.pathname === "/flip-book-viewer";

  return (
    <div className='main-content'>
      <div className='content'>
        {!hideHeaderFooter && <ContentTop />}
        {!hideHeaderFooter && <HeaderNavigation />}
        <ContentMain />
      </div>
      {!hideHeaderFooter && <ContentBottom />}
    </div>
  );
};

export default Content;
