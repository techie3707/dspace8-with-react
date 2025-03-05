import "./Content.css";
import ContentTop from '../../components/ContentTop/ContentTop';
import ContentMain from '../../components/ContentMain/ContentMain';

const Content: React.FC = () => {
  return (
    <div className='main-content'>
      <ContentTop />
      <ContentMain />
      
    </div>
  );
};

export default Content;
