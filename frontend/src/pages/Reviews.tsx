import React, { useState, useEffect } from 'react';
import { reviewService } from '../services/api';
import type { Review } from '../types';
import { clsx } from 'clsx';

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    sentiment: '',
    rating: '',
    platform: '',
    search: '',
    page: 1,
    limit: 10
  });

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const result = await reviewService.getReviews({
          ...filters,
          rating: filters.rating ? parseInt(filters.rating) : undefined
        });
        setReviews(result.reviews);
        setTotal(result.total);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [filters]);

  const totalPages = Math.ceil(total / filters.limit);

  const getSentimentStyles = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return "bg-green-100 text-green-700";
      case 'negative': return "bg-red-100 text-red-700";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  const getPlatformBadge = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('shopee')) return "bg-[#EE4D2D] text-white";
    if (p.includes('lazada')) return "bg-[#00008F] text-white";
    if (p.includes('tiki')) return "bg-[#1890FF] text-white";
    if (p.includes('tiktok')) return "bg-black text-white";
    return "bg-slate-200 text-slate-700";
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">

      {/* Filters Toolbar */}
      <div className="bg-white rounded-lg border border-[#c6c6cd] p-5 flex flex-wrap gap-6 items-center shadow-sm">
        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
          <label className="text-[12px] font-bold text-[#505f76] px-1 uppercase tracking-wider">Tìm kiếm</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d] text-[18px]">search</span>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              placeholder="Tìm kiếm trong đánh giá..."
              className="w-full bg-[#f6f3f4] border border-[#c6c6cd] rounded-md pl-10 pr-4 py-2 text-[14px] focus:ring-2 focus:ring-black outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-bold text-[#505f76] px-1 uppercase tracking-wider">Sắc thái</label>
          <select
            value={filters.sentiment}
            onChange={(e) => setFilters({ ...filters, sentiment: e.target.value, page: 1 })}
            className="bg-white border border-[#c6c6cd] rounded-md px-4 py-2 text-[14px] font-medium focus:ring-2 focus:ring-black outline-none min-w-[150px]"
          >
            <option value="">Tất cả cảm xúc</option>
            <option value="positive">Tích cực</option>
            <option value="negative">Tiêu cực</option>
            <option value="neutral">Trung lập</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-bold text-[#505f76] px-1 uppercase tracking-wider">Xếp hạng</label>
          <select
            value={filters.rating}
            onChange={(e) => setFilters({ ...filters, rating: e.target.value, page: 1 })}
            className="bg-white border border-[#c6c6cd] rounded-lg px-4 py-2 text-[14px] font-medium focus:ring-2 focus:ring-black outline-none min-w-[130px]"
          >
            <option value="">Tất cả sao</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-bold text-[#505f76] px-1 uppercase tracking-wider">Nền tảng</label>
          <select
            value={filters.platform}
            onChange={(e) => setFilters({ ...filters, platform: e.target.value, page: 1 })}
            className="bg-white border border-[#c6c6cd] rounded-md px-4 py-2 text-[14px] font-medium focus:ring-2 focus:ring-black outline-none min-w-[150px]"
          >
            <option value="">Tất cả sàn</option>
            <option value="shopee">Shopee</option>
            <option value="lazada">Lazada</option>
            <option value="tiki">Tiki</option>
          </select>
        </div>

        <div className="ml-auto self-end pb-1">
          <button
            onClick={() => setFilters({ sentiment: '', rating: '', platform: '', search: '', page: 1, limit: 10 })}
            className="text-[#505f76] hover:text-black font-bold text-[12px] flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]" data-icon="filter_list_off">filter_list_off</span>
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Reviews Table Container */}
      <div className="bg-white rounded-lg border border-[#c6c6cd] shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto min-h-[600px] relative">
          {loading && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-black/10 overflow-hidden z-20">
              <div className="h-full bg-black animate-[loading_1.5s_infinite_linear] w-[30%] shadow-[0_0_10px_rgba(0,0,0,0.5)]"></div>
            </div>
          )}

          <table className={clsx("w-full text-left border-collapse transition-opacity duration-300", loading && "opacity-60 pointer-events-none")}>
            <thead>
              <tr className="bg-[#fcf8fa] border-b border-[#c6c6cd]">
                <th className="px-6 py-4 font-black text-[11px] text-[#505f76] uppercase tracking-wider w-[180px]">Người dùng</th>
                <th className="px-6 py-4 font-black text-[11px] text-[#505f76] uppercase tracking-wider">Nội dung đánh giá</th>
                <th className="px-6 py-4 font-black text-[11px] text-[#505f76] uppercase tracking-wider w-[160px]">Sắc thái</th>
                <th className="px-6 py-4 font-black text-[11px] text-[#505f76] uppercase tracking-wider w-[120px] text-center">Nền tảng</th>
                <th className="px-6 py-4 font-black text-[11px] text-[#505f76] uppercase tracking-wider w-[140px]">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c6c6cd]">
              {reviews.length === 0 && !loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-[#505f76] font-medium italic">
                    Không tìm thấy đánh giá nào khớp với điều kiện lọc.
                  </td>
                </tr>
              ) : (
                reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-[#fcf8fa] transition-colors group">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-9 h-9 rounded-md bg-black text-white flex items-center justify-center font-bold text-[13px] shadow-sm">
                          {rev.author?.charAt(0) || 'U'}
                        </div>
                        <div className="ml-3">
                          <p className="text-[13px] font-bold text-[#1b1b1d] truncate max-w-[100px]">{rev.author || 'Người dùng'}</p>
                          <div className="flex text-amber-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: i < (rev.rating || 5) ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-[#1b1b1d] text-[14px] line-clamp-2 leading-relaxed font-medium">{rev.content}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className={clsx(
                          "w-2 h-2 rounded-full",
                          rev.sentiment === 'positive' ? "bg-emerald-500" : rev.sentiment === 'neutral' ? "bg-amber-500" : "bg-red-500"
                        )}></span>
                        <span className={clsx(
                          "text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded",
                          getSentimentStyles(rev.sentiment)
                        )}>
                          {rev.sentiment === 'positive' ? 'Tích cực' : rev.sentiment === 'negative' ? 'Tiêu cực' : 'Trung lập'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={clsx(
                        "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter inline-block min-w-[60px]",
                        getPlatformBadge(rev.platform)
                      )}>
                        {rev.platform.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-[#505f76] font-mono text-[11px] whitespace-nowrap">
                      {rev.date || '2024-03-20'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 0 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-[#c6c6cd] bg-[#fcf8fa]">
            <div className="text-[#505f76] text-[12px] font-bold">
              Hiển thị {((filters.page - 1) * filters.limit) + 1} - {Math.min(filters.page * filters.limit, total)} của {total.toLocaleString()} kết quả
            </div>
            <div className="flex items-center space-x-2">
              {/* Controls */}
              <button
                disabled={filters.page === 1}
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-[#c6c6cd] text-[#505f76] hover:bg-white hover:text-black hover:border-black transition-all disabled:opacity-30 disabled:pointer-events-none"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>

              {/* Dynamic Pages */}
              {(() => {
                const pages = [];
                const radius = 1;
                const start = Math.max(1, filters.page - radius);
                const end = Math.min(totalPages, filters.page + radius);

                if (start > 1) {
                  pages.push(
                    <button key={1} onClick={() => setFilters({ ...filters, page: 1 })} className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#c6c6cd] text-[12px] font-bold text-[#505f76] hover:border-black hover:text-black transition-all">1</button>
                  );
                  if (start > 2) pages.push(<span key="sep1" className="px-1 text-[#c6c6cd] font-bold">...</span>);
                }

                for (let p = start; p <= end; p++) {
                  pages.push(
                    <button
                      key={p}
                      onClick={() => setFilters({ ...filters, page: p })}
                      className={clsx(
                        "w-8 h-8 flex items-center justify-center rounded-lg border text-[12px] font-bold transition-all shadow-sm",
                        filters.page === p ? "border-black bg-black text-white" : "border-[#c6c6cd] text-[#505f76] hover:border-black hover:text-black bg-white"
                      )}
                    >
                      {p}
                    </button>
                  );
                }

                if (end < totalPages) {
                  if (end < totalPages - 1) pages.push(<span key="sep2" className="px-1 text-[#c6c6cd] font-bold">...</span>);
                  pages.push(
                    <button key={totalPages} onClick={() => setFilters({ ...filters, page: totalPages })} className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#c6c6cd] text-[12px] font-bold text-[#505f76] hover:border-black hover:text-black transition-all">{totalPages}</button>
                  );
                }
                return pages;
              })()}

              <button
                disabled={filters.page === totalPages}
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-[#c6c6cd] text-[#505f76] hover:bg-white hover:text-black hover:border-black transition-all disabled:opacity-30 disabled:pointer-events-none"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </div>
  );
};

export default Reviews;
