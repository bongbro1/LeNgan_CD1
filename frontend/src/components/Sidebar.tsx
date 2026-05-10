import React from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SidebarProps {
  isOpen?: boolean;
}

const menuItems = [
  { id: 'dashboard', label: 'Tổng quan', icon: 'grid_view', path: '/' },
  { id: 'analyze', label: 'Phân tích sản phẩm', icon: 'analytics', path: '/analyze' },
  { id: 'reviews', label: 'Danh sách đánh giá', icon: 'rate_review', path: '/reviews' },
  { id: 'model', label: 'Demo mô hình', icon: 'model_training', path: '/model' },
  { id: 'insights', label: 'AI Insights', icon: 'insights', path: '/insights' },
  { id: 'settings', label: 'Cài đặt', icon: 'settings', path: '/settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false }) => {
  return (
    <aside className={twMerge(
      clsx(
        "h-screen w-72 fixed left-0 top-0 bg-white border-r border-[#c6c6cd] shadow-sm flex flex-col py-6 z-50 transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )
    )}>
      <div className="px-6 mb-8">
        <h1 className="text-[20px] font-bold text-black tracking-tight">Sentiment Analysis</h1>
        <p className="text-[12px] text-[#505f76] uppercase tracking-widest mt-1 font-bold opacity-80">Hệ thống phân tích</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => clsx(
              "w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200",
              isActive
                ? "text-black font-bold border-r-4 border-black bg-[#f6f3f4]"
                : "text-[#505f76] font-medium hover:bg-[#f6f3f4]"
            )}
          >
            <span className="material-symbols-outlined mr-3" style={{ fontVariationSettings: "'FILL' 0" }}>{item.icon}</span>
            <span className="text-[14px]">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-4 mt-auto">
        <div className="p-4 bg-[#f6f3f4] rounded-xl border border-[#c6c6cd] flex items-center">
          <img
            alt="User Profile"
            className="w-10 h-10 rounded-full mr-3 border border-[#c6c6cd]"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoWEZM8u-_zeq5YynsqxqZUtELQpQtTRJzOrwTaW9eA5l8bE5gTmWswYWXSk_cN7rKyItf2g6ONU9Y3kEumv8DO0Jo-N6mPIZWzauiS06a3vJ4RYBAKPSxjzOJYceDza_ziwNnm5uo5QyjatdpQgvNH51Nj2krBYjQT27DXTEhYFGug8_JJpT673XyFz7pj3k6B-svrzko8pbp7F4T6WTtz_bnTi8PmB_E-0mNViPVqZzEfUzxrGi0bNEAtFY__UYp1klCrltn4Kc"
          />
          <div className="overflow-hidden">
            <p className="font-bold text-[#1b1b1d] truncate text-[14px]">Admin User</p>
            <p className="text-[11px] text-[#505f76] truncate font-medium">admin@analytics.ai</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
