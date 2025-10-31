import { Link, useLocation } from 'react-router-dom';
import { Clock, BarChart3, Target, Folder } from 'lucide-react';
import './SideNavigation.css';
import { logout } from '../utils/auth';
import { retrieveUser } from '../utils/auth';
import { isError } from '../utils/utils';

const Sidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/home', icon: BarChart3, label: 'Dashboard' },
    { path: '/tracker', icon: Clock, label: 'Tracker' },
    { path: '/projects', icon: Folder, label: 'Projects' },
    { path: '/goals', icon: Target, label: 'Goals' },
  ];
  let loggedInUser = (retrieveUser());
  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Clock className="sidebar-logo-icon" />
        </div>
        <div>
          {!isError(loggedInUser) && (
          <div>
            <div className="sidebar-title">TimeSheeter</div>
            <div className="sidebar-subtitle">{loggedInUser.name}</div>
          </div>
        )}
        </div>
      </div>
      
      <div className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon className="sidebar-icon" />
              <span className="sidebar-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
      <button id = "logout-btn" onClick={logout}>Log out</button>
    </div>
  );
};

export default Sidebar;