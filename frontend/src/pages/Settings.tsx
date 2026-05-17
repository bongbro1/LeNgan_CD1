import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { analyzeService } from '../services/api';

const Settings: React.FC = () => {
  const [crawlerMode, setCrawlerMode] = useState<'mock' | 'real'>('real');
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [lastCheck, setLastCheck] = useState<string | null>(null);

  const checkConnection = async () => {
    setApiStatus('checking');
    try {
      // Dùng endpoint history để test kết nối
      await analyzeService.getHistory();
      setApiStatus('online');
      setLastCheck(new Date().toLocaleTimeString('vi-VN'));
    } catch (error) {
      setApiStatus('offline');
      setLastCheck(new Date().toLocaleTimeString('vi-VN'));
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Page Header with Action Buttons */}
      <div className="mb-stack-lg flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-[30px] font-bold text-[#1b1b1d] leading-[38px]">Cài đặt hệ thống</h1>
          <p className="text-[#505f76] text-[16px] mt-1">Cấu hình tham số mô hình, bộ thu thập dữ liệu và kết nối cơ sở dữ liệu.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-2.5 border border-[#c6c6cd] rounded-lg font-black text-[13px] text-[#505f76] hover:bg-[#f6f3f4] transition-all">Hủy bỏ</button>
          <button className="px-6 py-2.5 bg-black text-white rounded-lg font-black text-[13px] shadow-lg hover:opacity-90 active:scale-95 transition-all">Lưu cấu hình</button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-8">

        {/* Left Column: API & Database Status */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          {/* API Status Section */}
          <div className="bg-white border border-[#c6c6cd] rounded-lg p-6 shadow-sm">
            <div className="flex items-end justify-between mb-6">
              <h3 className="text-[20px] font-bold text-[#1b1b1d] leading-none">API Status</h3>
              <div className="flex items-center gap-3">
                {lastCheck && (
                  <span className="text-[9px] font-black text-[#505f76] uppercase tracking-tighter bg-[#f6f3f4] px-1.5 py-0.5 rounded border border-[#c6c6cd]">
                    Last: {lastCheck}
                  </span>
                )}
                <span className="flex h-3 w-3 relative mb-1">
                  <span className={clsx(
                    "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                    apiStatus === 'online' ? "bg-emerald-400" : apiStatus === 'checking' ? "bg-amber-400" : "bg-red-400"
                  )}></span>
                  <span className={clsx(
                    "relative inline-flex rounded-full h-3 w-3",
                    apiStatus === 'online' ? "bg-emerald-500" : apiStatus === 'checking' ? "bg-amber-500" : "bg-red-500"
                  )}></span>
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-[#fcf8fa] rounded-lg border border-[#c6c6cd]/30">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#505f76]" data-icon="dns">dns</span>
                  <span className="text-[14px] font-bold text-[#1b1b1d]">Main Endpoint</span>
                </div>
                <span className={clsx(
                  "font-mono px-2.5 py-1 rounded text-[10px] font-black tracking-widest uppercase",
                  apiStatus === 'online' ? "text-emerald-600 bg-emerald-50" :
                    apiStatus === 'checking' ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50"
                )}>
                  {apiStatus === 'checking' ? 'CHECKING...' : apiStatus === 'online' ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-[#c6c6cd]">
                <button
                  onClick={checkConnection}
                  disabled={apiStatus === 'checking'}
                  className="w-full py-3 bg-black text-white rounded-md font-bold text-[14px] hover:opacity-90 active:scale-[0.98] transition-all shadow-md disabled:opacity-50"
                >
                  {apiStatus === 'checking' ? 'Đang kiểm tra...' : 'Làm mới kết nối'}
                </button>
              </div>
            </div>
          </div>

          {/* Database Status */}
          <div className="bg-white border border-[#c6c6cd] rounded-lg p-6 shadow-sm">
            <h3 className="text-[20px] font-bold text-[#1b1b1d] mb-6">Database Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-bold text-[#505f76] uppercase tracking-wider">Type</span>
                <span className="font-mono font-black text-[#1b1b1d]">SQLite 3 (Flask)</span>
              </div>
              <div className="w-full bg-[#f6f3f4] rounded-full h-2 mt-6 overflow-hidden">
                <div className="bg-black h-full rounded-full" style={{ width: '42%' }}></div>
              </div>
              <div className="flex justify-between text-[11px] mt-1 font-bold">
                <span className="text-[#505f76]">Storage Used: 4.2GB</span>
                <span className="text-[#505f76]">Total: 10GB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Model Info */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white border border-[#c6c6cd] rounded-lg p-6 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="text-[20px] font-bold text-[#1b1b1d]">Mô hình AI (Inference)</h3>
                <p className="text-[14px] text-[#505f76] font-medium mt-1">Cấu hình mô hình xử lý ngôn ngữ hiện tại</p>
              </div>
              <span className="px-4 py-1.5 bg-black text-white text-[11px] rounded-full font-black tracking-widest uppercase">ACTIVE</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="p-5 bg-[#fcf8fa] rounded-lg border border-[#c6c6cd]">
                <p className="text-[11px] text-[#505f76] font-black uppercase tracking-widest mb-1">Architecture</p>
                <p className="text-[22px] font-bold text-[#1b1b1d]">Claude Sonnet 4.5</p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#505f76]">memory</span>
                  <span className="text-[13px] text-[#505f76] font-medium">via 9Router (Kiro Provider)</span>
                </div>
              </div>
              <div className="p-5 bg-[#fcf8fa] rounded-lg border border-[#c6c6cd]">
                <p className="text-[11px] text-[#505f76] font-black uppercase tracking-widest mb-1">Primary Task</p>
                <p className="text-[22px] font-bold text-[#1b1b1d]">AI Insights & Chat</p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#505f76]">psychology</span>
                  <span className="text-[13px] text-[#505f76] font-medium">Conversational AI (Free Tier)</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-auto">
              {[
                { label: 'Model Size', val: '~200B', up: null },
                { label: 'Context', val: '200K', up: null },
                { label: 'Cost', val: '$0.00', up: 'Free' },
                { label: 'Latency', val: '~2s', up: null }
              ].map((m, i) => (
                <div key={i} className="text-center p-4 border-r border-[#c6c6cd] last:border-0">
                  <p className="text-[11px] font-black text-[#505f76] uppercase tracking-widest mb-2">{m.label}</p>
                  <p className="text-[24px] font-black text-[#1b1b1d]">{m.val}</p>
                  {m.up && (
                    <div className="flex items-center justify-center text-green-600 gap-1 mt-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      <span className="text-[11px] font-black">{m.up}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Full Width: Crawler Configuration */}
        <div className="col-span-12">
          <div className="bg-white border border-[#c6c6cd] rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[28px]">travel_explore</span>
              </div>
              <div>
                <h3 className="text-[20px] font-bold text-[#1b1b1d]">Cấu hình bộ thu thập dữ liệu</h3>
                <p className="text-[14px] text-[#505f76] font-medium">Quản lý cách hệ thống lấy dữ liệu từ các sàn thương mại điện tử</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Crawler Mode */}
              <div className="space-y-4">
                <label className="text-[11px] font-black text-[#505f76] uppercase tracking-widest">Chế độ vận hành</label>
                <div className="flex gap-2 p-1 bg-[#f6f3f4] rounded-lg border border-[#c6c6cd]">
                  <button
                    onClick={() => setCrawlerMode('mock')}
                    className={clsx(
                      "flex-1 py-3 rounded-md flex flex-col items-center gap-0.5 transition-all",
                      crawlerMode === 'mock' ? "bg-white shadow-md text-black" : "text-[#505f76] hover:bg-white/50"
                    )}
                  >
                    <span className="font-black text-[14px]">Mock</span>
                    <span className="text-[10px] font-bold opacity-60">Dữ liệu giả lập</span>
                  </button>
                  <button
                    onClick={() => setCrawlerMode('real')}
                    className={clsx(
                      "flex-1 py-3 rounded-md flex flex-col items-center gap-0.5 transition-all",
                      crawlerMode === 'real' ? "bg-black text-white shadow-md" : "text-[#505f76] hover:bg-black/10"
                    )}
                  >
                    <span className="font-black text-[14px]">Real</span>
                    <span className="text-[10px] font-bold opacity-60">Thời gian thực</span>
                  </button>
                </div>
              </div>

              {/* Supported Platforms */}
              <div className="md:col-span-2 space-y-4">
                <label className="text-[11px] font-black text-[#505f76] uppercase tracking-widest">Nền tảng hỗ trợ</label>
                <div className="flex flex-wrap gap-4">
                  {[
                    { name: 'Tiki', status: 'Active', icon: 'shopping_bag', color: 'bg-blue-50 text-blue-700', active: true },
                    { name: 'Lazada', status: 'Active', icon: 'local_mall', color: 'bg-indigo-50 text-indigo-700', active: true },
                    { name: 'Shopee', status: 'Maintenance', icon: 'shopping_basket', color: 'bg-orange-50 text-orange-600', active: false },
                    { name: 'TikTok Shop', status: 'In Dev', icon: 'movie', color: 'bg-pink-50 text-pink-500', active: false }
                  ].map((p, i) => (
                    <div key={i} className={clsx(
                      "flex items-center gap-3 px-5 py-3 bg-white border border-[#c6c6cd] rounded-lg transition-all",
                      !p.active && "opacity-40 grayscale"
                    )}>
                      <div className={clsx("w-10 h-10 flex items-center justify-center rounded-md shadow-inner", p.color)}>
                        <span className="material-symbols-outlined text-[24px]">{p.icon}</span>
                      </div>
                      <div>
                        <p className="font-black text-[14px] text-[#1b1b1d]">{p.name}</p>
                        <p className={clsx("text-[10px] font-black uppercase tracking-tighter", p.active ? "text-green-600" : "text-[#505f76]")}>
                          {p.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
