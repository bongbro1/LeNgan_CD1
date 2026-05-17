import React from 'react';

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  return (
    <header className="fixed top-0 right-0 w-full lg:w-[calc(100%-18rem)] h-16 bg-surface border-b border-outline-variant shadow-sm flex justify-between items-center px-gutter z-40">
      <div className="flex items-center space-x-gutter">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 text-secondary hover:bg-surface-container-high rounded-md lg:hidden"
        >
          <span className="material-symbols-outlined" data-icon="menu">menu</span>
        </button>
        <h2 className="text-[20px] font-bold text-primary tracking-tight">{title}</h2>
        <div className="hidden xl:flex items-center space-x-2">
          <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[11px] font-black rounded-full flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Flask API Connected
          </span>
          <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant text-[11px] font-black rounded-full">
            PhoBERT Model
          </span>
          <span className="px-3 py-1 border border-outline text-secondary text-[11px] font-black rounded-full">
            Analysis Mode
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-6">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined text-secondary cursor-pointer hover:text-primary transition-colors" data-icon="notifications">notifications</span>
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full"></span>
        </div>
        <div className="flex items-center">
          <span className="material-symbols-outlined text-secondary cursor-pointer hover:text-primary transition-colors" data-icon="language">language</span>
        </div>
        <div className="flex items-center">
          <span className="material-symbols-outlined text-secondary cursor-pointer hover:text-primary transition-colors text-3xl" data-icon="account_circle">account_circle</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
