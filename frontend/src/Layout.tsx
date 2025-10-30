import type { ReactNode } from 'react';
import Sidebar from './components/SideNavigation';
import './Layout.css'; // or wherever your layout styles are

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="layout">
      <Sidebar />
      <main className="layout-main">
        {children}
      </main>
    </div>
  );
};