import "./Content.css";
import ContentTop from '../../components/ContentTop/ContentTop';
import ContentMain from '../../components/ContentMain/ContentMain';
import ContentBottom from "../../components/ContentBottom/ContentBottom";

const Content: React.FC = () => {
  return (
    <div className='main-content'>
      <div className='content'>
      <ContentTop />
      <ContentMain />
      </div>
      <ContentBottom />
    </div>
  );
};

export default Content;
