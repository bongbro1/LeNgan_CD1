import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const getTitle = () => {
    switch (location.pathname) {
      case '/': return 'Tổng quan hệ thống';
      case '/analyze': return 'Phân tích sản phẩm';
      case '/reviews': return 'Dữ liệu đánh giá';
      case '/model': return 'Demo mô hình';
      case '/insights': return 'AI Data Insights';
      case '/settings': return 'Cài đặt hệ thống';
      default: return 'Sentiment Analysis';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fcf8fa]">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-[#1b1b1d]/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <Sidebar isOpen={isSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-72">
        <Header
          title={getTitle()}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        {/* Spacer to push content below fixed header */}
        <div className="h-16 w-full"></div>

        <main className="p-4 md:p-8">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
