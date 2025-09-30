import React from 'react';
import { NavLink } from 'react-router-dom';

const Header: React.FC = () => {
  const navLinkClasses = ({ isActive }: { isActive: boolean }): string =>
    `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-habitica-light text-habitica-darker'
        : 'text-habitica-text-secondary hover:bg-habitica-main hover:text-habitica-text'
    }`;

  return (
    <header className="bg-habitica-dark shadow-lg">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <NavLink to="/" className="text-xl font-bold text-habitica-light">
          Daily Surprise
        </NavLink>
        <div className="flex items-center space-x-4">
          <NavLink to="/" className={navLinkClasses}>About</NavLink>
          <NavLink to="/create" className={navLinkClasses}>Create Challenge</NavLink>
          <NavLink to="/challenges" className={navLinkClasses}>My Challenges</NavLink>
          <NavLink to="/profile" className={navLinkClasses}>Profile</NavLink>
        </div>
      </nav>
    </header>
  );
};

export default Header;
