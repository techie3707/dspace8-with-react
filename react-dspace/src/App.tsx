import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';
import Content from './layout/Content/Content';
import Sidebar from './layout/Sidebar/Sidebar';
import { SidebarProvider } from './contexts/sidebarContext';

const App: React.FC = () => {
  return (
    <SidebarProvider>
      <Router>
        <div className='app'>
          <Sidebar />
          <Content />
        </div>
      </Router>
    </SidebarProvider>
  );
};

export default App;