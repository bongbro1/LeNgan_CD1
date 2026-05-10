import React, { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip
} from 'recharts';
import { clsx } from 'clsx';
import { dashboardService } from '../services/api';
import type { DashboardData } from '../types';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await dashboardService.getDashboardData();
        setData(result);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-error">Không thể tải dữ liệu dashboard.</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* ROW 1: Summary Metrics Bento Grid - EXACTLY FROM UI TEMPLATE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        {/* Tổng đánh giá (Large card) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#c6c6cd] shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[#505f76] font-medium text-[14px]">Tổng đánh giá</span>
            <span className="material-symbols-outlined text-[#505f76]" data-icon="forum">forum</span>
          </div>
          <div className="flex items-end justify-between">
            <h1 className="text-[30px] leading-[38px] font-bold text-[#1b1b1d]">{data.summary.total_reviews.toLocaleString()}</h1>
            <span className="text-green-600 text-[12px] font-bold flex items-center mb-1">
              <span className="material-symbols-outlined text-sm mr-1" data-icon="trending_up">trending_up</span>
              +12%
            </span>
          </div>
        </div>

        {/* Tích cực */}
        <div className="bg-white p-6 rounded-xl border border-[#c6c6cd] shadow-sm">
          <p className="text-[#505f76] text-[12px] font-bold uppercase mb-2">Tích cực</p>
          <div className="flex items-center justify-between">
            <span className="text-[24px] leading-[32px] font-bold text-green-600">{data.summary.positive}</span>
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600" data-icon="sentiment_very_satisfied">sentiment_very_satisfied</span>
            </div>
          </div>
        </div>

        {/* Trung lập */}
        <div className="bg-white p-6 rounded-xl border border-[#c6c6cd] shadow-sm">
          <p className="text-[#505f76] text-[12px] font-bold uppercase mb-2">Trung lập</p>
          <div className="flex items-center justify-between">
            <span className="text-[24px] leading-[32px] font-bold text-[#505f76]">{data.summary.neutral}</span>
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#505f76]" data-icon="sentiment_neutral">sentiment_neutral</span>
            </div>
          </div>
        </div>

        {/* Tiêu cực */}
        <div className="bg-white p-6 rounded-xl border border-[#c6c6cd] shadow-sm">
          <p className="text-[#505f76] text-[12px] font-bold uppercase mb-2">Tiêu cực</p>
          <div className="flex items-center justify-between">
            <span className="text-[24px] leading-[32px] font-bold text-[#ba1a1a]">{data.summary.negative}</span>
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#ba1a1a]" data-icon="sentiment_very_dissatisfied">sentiment_very_dissatisfied</span>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="bg-white p-6 rounded-xl border border-[#c6c6cd] shadow-sm">
          <p className="text-[#505f76] text-[12px] font-bold uppercase mb-2">Rating</p>
          <div className="flex items-center justify-between">
            <span className="text-[24px] leading-[32px] font-bold text-[#1b1b1d]">{data.summary.average_rating}</span>
            <div className="flex text-amber-400">
              <span className="material-symbols-outlined text-sm" data-icon="star" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: Analysis Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-[#c6c6cd] shadow-sm flex flex-col items-center justify-center space-y-8 min-h-[400px]">
          <div className="text-center">
            <h3 className="text-[20px] font-bold mb-1 text-[#1b1b1d]">Sentiment Score</h3>
            <p className="text-[13px] text-[#505f76] font-bold">Dựa trên PhoBERT Model</p>
          </div>
          <div className="relative w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.sentiment_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  startAngle={90}
                  endAngle={-270}
                >
                  {data.sentiment_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[30px] font-bold text-[#1b1b1d]">{data.summary.sentiment_score}</span>
              <span className="text-[12px] text-[#505f76] font-bold">/100</span>
            </div>
          </div>
          <div className="w-full space-y-3 px-4">
            {data.sentiment_distribution.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                  <span className="text-[14px] font-medium text-[#45464c]">{item.name}</span>
                </div>
                <span className="font-bold text-[#1b1b1d] text-[14px]">{Math.round((item.value / data.summary.total_reviews) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-[#c6c6cd] shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-[20px] font-bold text-[#1b1b1d]">Xu hướng cảm xúc</h3>
              <p className="text-[14px] text-[#505f76]">Phân tích theo dòng thời gian</p>
            </div>
            <div className="flex bg-[#f6f3f4] p-1 rounded-lg">
              <button className="px-4 py-1.5 text-[12px] font-bold bg-white shadow-sm rounded-md">30 Ngày</button>
            </div>
          </div>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trend_data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="100%">
                    <stop offset="5%" stopColor="#000000" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area
                  type="monotone"
                  dataKey="positive"
                  stroke="#000000"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorTrend)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ROW 3: Issues & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-[#c6c6cd] shadow-sm">
          <h3 className="text-[20px] font-bold mb-6 text-[#1b1b1d]">Vấn đề tiêu cực hàng đầu</h3>
          <div className="space-y-6 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
            {data.top_issues.length > 0 ? (
              data.top_issues.map((item, index) => (
                <div key={index} className="group cursor-pointer">
                  <div className="flex justify-between text-[14px] mb-2">
                    <span className="font-bold text-[#1b1b1d]">{item.issue}</span>
                    <span className="text-[#ba1a1a] font-bold">{item.count} lượt nhắc</span>
                  </div>
                  <div className="w-full bg-[#eae7e9] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#ba1a1a] h-full rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min((item.count / (data.summary.negative || 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <span className="material-symbols-outlined text-[#c6c6cd] text-[48px] mb-2">check_circle</span>
                <p className="text-[#505f76] text-[14px] font-medium">Không phát hiện vấn đề nghiêm trọng nào.</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-8 bg-white rounded-xl border border-[#c6c6cd] shadow-sm overflow-hidden">
          <div className="p-6 flex justify-between items-center border-b border-[#c6c6cd]">
            <h3 className="text-[20px] font-bold text-[#1b1b1d]">Đánh giá gần đây</h3>
            <button className="text-black font-bold text-[14px] flex items-center hover:underline group">
              Xem tất cả
              <span className="material-symbols-outlined ml-1 group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f6f3f4] text-[#505f76] text-[11px] font-black uppercase tracking-wider">
                  <th className="px-6 py-4">Nội dung</th>
                  <th className="px-4 py-4">Rating</th>
                  <th className="px-4 py-4 text-center">Sentiment</th>
                  <th className="px-6 py-4 text-right">Ngày</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c6c6cd]">
                {data.recent_reviews && data.recent_reviews.length > 0 ? (
                  data.recent_reviews.map((rev, idx) => (
                    <tr key={rev.id || idx} className="hover:bg-[#f6f3f4] transition-colors group">
                      <td className="px-6 py-4">
                        <p className="text-[14px] font-medium text-[#1b1b1d] line-clamp-1">{rev.content}</p>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: i < rev.rating ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={clsx(
                          "px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-block min-w-[70px]",
                          rev.sentiment === 'positive' ? "bg-green-100 text-green-700" :
                            rev.sentiment === 'negative' ? "bg-red-100 text-red-700" :
                              "bg-slate-100 text-slate-600"
                        )}>
                          {rev.sentiment}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-[#505f76] text-[12px] font-medium whitespace-nowrap">
                        {rev.date || 'Gần đây'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-[#505f76] italic">Chưa có đánh giá nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
