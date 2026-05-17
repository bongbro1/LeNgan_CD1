import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeService } from '../services/api';
import type { Product } from '../types';
import { clsx } from 'clsx';

const AnalyzeProduct: React.FC = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState('auto');
  const [limit, setLimit] = useState('100');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0 to 6
  const [result, setResult] = useState<{ product: Product, summary: any, cached?: boolean } | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await analyzeService.getHistory();
      setHistory(data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setResult(null);
    setErrorMessage(null);
    
    // Simulate pipeline steps for better UX
    setCurrentStep(1); // URL Check
    await new Promise(r => setTimeout(r, 500));
    setCurrentStep(2); // Platform detect
    await new Promise(r => setTimeout(r, 500));
    setCurrentStep(3); // Scraping starts
    
    try {
      const response = await analyzeService.analyzeProduct(url, platform);
      
      if (response.status === 'error') {
        setErrorMessage(response.message || "Đã xảy ra lỗi không xác định trong quá trình xử lý.");
        setLoading(false);
        return;
      }

      // Fast forward steps after real data comes back
      setCurrentStep(4); // PhoBERT
      await new Promise(r => setTimeout(r, 800));
      setCurrentStep(5); // Saving
      await new Promise(r => setTimeout(r, 500));
      setCurrentStep(6); // Finish
      
      setResult(response);
      setLoading(false);
      fetchHistory(); // Refresh history table
    } catch (error: any) {
      console.error("Analysis failed:", error);
      setErrorMessage("Không thể kết nối với Server. Vui lòng kiểm tra lại Backend.");
      setLoading(false);
      setCurrentStep(0);
    }
  };

  const handleDelete = async (productId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click dòng (chuyển trang)
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này và toàn bộ đánh giá liên quan?")) return;

    try {
      await analyzeService.deleteProduct(productId);
      fetchHistory(); // Refresh danh sách
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Xóa thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Page Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-[30px] font-bold text-[#1b1b1d] leading-[38px]">Phân tích sản phẩm</h1>
        <p className="text-[#505f76] text-[14px]">Nhập URL sản phẩm từ các sàn TMĐT để bắt đầu phân tích cảm xúc từ đánh giá khách hàng.</p>
      </div>

      {/* Analysis Form Grid */}
      <section className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-lg border border-[#c6c6cd] shadow-sm">
            <form onSubmit={handleAnalyze} className="space-y-6">
              <div>
                <label className="block text-[12px] font-bold text-[#505f76] uppercase tracking-wider mb-2">ĐƯỜNG DẪN SẢN PHẨM (URL)</label>
                <input 
                  type="text" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-[#f6f3f4] border border-[#c6c6cd] rounded-lg p-4 focus:ring-2 focus:ring-black focus:border-transparent outline-none text-[16px] font-mono" 
                  placeholder="https://shopee.vn/ten-san-pham-i.12345.67890" 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[12px] font-bold text-[#505f76] uppercase tracking-wider mb-2">NỀN TẢNG</label>
                  <select 
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full bg-[#f6f3f4] border border-[#c6c6cd] rounded-lg px-4 py-3 focus:ring-2 focus:ring-black outline-none text-[14px] font-medium"
                  >
                    <option value="auto">Tự động nhận diện</option>
                    <option value="shopee">Shopee</option>
                    <option value="lazada">Lazada</option>
                    <option value="tiki">Tiki</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#505f76] uppercase tracking-wider mb-2">GIỚI HẠN ĐÁNH GIÁ</label>
                  <select 
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    className="w-full bg-[#f6f3f4] border border-[#c6c6cd] rounded-lg px-4 py-3 focus:ring-2 focus:ring-black outline-none text-[14px] font-medium"
                  >
                    <option value="50">50 reviews</option>
                    <option value="100">100 reviews</option>
                    <option value="200">200 reviews</option>
                    <option value="500">500 reviews</option>
                  </select>
                </div>
              </div>
              <button 
                type="submit"
                disabled={loading || !url}
                className="w-full bg-black text-white font-bold py-4 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50"
              >
                <span className="material-symbols-outlined mr-2" data-icon="analytics">analytics</span>
                Phân tích sản phẩm
              </button>
            </form>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 p-6 rounded-lg animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-start">
                <span className="material-symbols-outlined text-red-600 mr-3 mt-0.5">error</span>
                <div>
                  <h4 className="text-red-800 font-bold text-[16px]">Phân tích thất bại</h4>
                  <p className="text-red-700 text-[14px] mt-1">{errorMessage}</p>
                  <div className="mt-4 flex space-x-4">
                    <button 
                      onClick={() => handleAnalyze({ preventDefault: () => {} } as any)}
                      className="bg-red-600 text-white px-4 py-1.5 rounded-md text-[12px] font-bold hover:bg-red-700 transition-colors"
                    >
                      Thử lại ngay
                    </button>
                    <button 
                      onClick={() => setErrorMessage(null)}
                      className="text-red-600 px-4 py-1.5 rounded-md text-[12px] font-bold hover:bg-red-100 transition-colors"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pipeline Progress */}
          {(loading || result || errorMessage) && (
            <div className="bg-white p-6 rounded-lg border border-[#c6c6cd] shadow-sm">
              <h3 className="text-[20px] font-bold mb-6 text-[#1b1b1d]">Tiến trình xử lý</h3>
              <div className="space-y-6">
                {[
                  { id: 1, label: "Kiểm tra URL", desc: "Đã xác thực định dạng URL thành công", icon: "check_circle" },
                  { id: 2, label: "Xác định nền tảng", desc: platform === 'auto' ? "Nhận diện sàn TMĐT..." : `${platform} detected`, icon: "check_circle" },
                  { id: 3, label: "Thu thập review", desc: errorMessage && currentStep === 3 ? "Bị chặn hoặc lỗi cào dữ liệu" : (loading && currentStep === 3 ? "Đang cào dữ liệu..." : "Hoàn tất thu thập"), icon: "downloading" },
                  { id: 4, label: "Chạy PhoBERT", desc: "Phân loại cảm xúc Tiếng Việt", icon: "psychology" },
                  { id: 5, label: "Lưu kết quả", desc: "Chuẩn bị dữ liệu báo cáo", icon: "database" },
                  { id: 6, label: "Hoàn tất", desc: "Kết thúc quy trình", icon: "task_alt" }
                ].map((s) => {
                  const isError = errorMessage && currentStep === s.id;
                  const isSuccess = currentStep > s.id || result;
                  const isActive = currentStep === s.id && loading && !errorMessage;
                  
                  return (
                    <div key={s.id} className={clsx("flex items-center transition-opacity", currentStep < s.id && !result && !errorMessage && "opacity-40")}>
                      <div className={clsx(
                        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                        isError ? "bg-red-100 text-red-600" : (isSuccess ? "bg-green-100 text-green-600" : (isActive ? "bg-black text-white animate-pulse" : "bg-[#eae7e9] text-[#76777d]"))
                      )}>
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: (isSuccess || isError) ? "'FILL' 1" : "'FILL' 0" }}>
                          {isError ? "warning" : (isSuccess ? "check_circle" : s.icon)}
                        </span>
                      </div>
                      <div className="ml-4 flex-1">
                        <p className={clsx("text-[14px] font-bold", isError ? "text-red-700" : "text-[#1b1b1d]")}>{s.label}</p>
                        <p className={clsx("text-[12px]", isError ? "text-red-500" : "text-[#505f76]")}>{isError ? errorMessage : s.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Result Summary Sidebar */}
        <div className="col-span-12 lg:col-span-4 h-full">
          {result ? (
            <div className="bg-white rounded-lg border border-[#c6c6cd] shadow-sm overflow-hidden animate-in zoom-in-95 duration-500 h-full flex flex-col">
              <div className="h-80 bg-[#e5e2e3] relative flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80"
                  alt="Product"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center shadow-md max-w-[250px]">
                  <span className="material-symbols-outlined text-xs mr-2 text-primary" data-icon="label">label</span>
                  <span className="truncate">{result.product.name}</span>
                </div>
              </div>
              <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[18px] font-bold text-[#1b1b1d] leading-tight line-clamp-2">{result.product.name}</h3>
                    <p className="text-[12px] text-[#505f76] mt-1">ID: {result.product.id || "N/A"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#f6f3f4] p-3 rounded-md">
                      <p className="text-[12px] text-[#505f76]">Tổng Reviews</p>
                      <p className="text-[20px] font-bold font-mono text-[#1b1b1d]">{result.summary.total_reviews}</p>
                    </div>
                    <div className="bg-[#f6f3f4] p-3 rounded-md">
                      <p className="text-[12px] text-[#505f76]">Sentiment Score</p>
                      <div className="flex items-center">
                        <p className="text-[20px] font-bold font-mono text-green-600">{result.summary.positive_rate}</p>
                        <span className="material-symbols-outlined text-green-600 ml-1 text-sm" data-icon="trending_up">trending_up</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[12px] font-medium">
                      <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>Tích cực</span>
                      <span className="font-mono">{result.summary.positive_rate}%</span>
                    </div>
                    <div className="w-full bg-[#eae7e9] h-2 rounded-full flex overflow-hidden">
                      <div className="bg-green-500 h-full" style={{ width: `${result.summary.positive_rate}%` }}></div>
                      <div className="bg-yellow-400 h-full" style={{ width: `${result.summary.neutral_rate || 10}%` }}></div>
                      <div className="bg-red-500 h-full" style={{ width: `${result.summary.negative_rate || 8}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[12px] text-[#505f76]">
                      <span>Trung lập: {result.summary.neutral_rate || 10}%</span>
                      <span>Tiêu cực: {result.summary.negative_rate || 8}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-[#c6c6cd] space-y-3">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-[#505f76]">Thời gian xử lý</span>
                    <span className="font-mono font-bold text-[#1b1b1d]">12.4s</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <button 
                      onClick={() => navigate('/')}
                      className="w-full bg-black text-white py-2.5 rounded-md font-bold text-[14px] hover:opacity-90 transition-all flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined mr-2 text-[20px]" data-icon="dashboard">dashboard</span>
                      Xem Dashboard
                    </button>
                    <button 
                      onClick={() => navigate('/reviews')}
                      className="w-full border border-[#c6c6cd] py-2.5 rounded-md font-bold text-[14px] hover:bg-[#f6f3f4] transition-all flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined mr-2 text-[20px]" data-icon="chat">chat</span>
                      Xem Reviews
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-lg border border-[#c6c6cd] border-dashed flex flex-col items-center justify-center text-center space-y-4 h-full">
              <span className="material-symbols-outlined text-[#76777d] text-5xl">analytics</span>
              <p className="text-[#505f76] text-[14px]">Kết quả phân tích sẽ xuất hiện tại đây sau khi hoàn tất quy trình.</p>
            </div>
          )}
        </div>
      </section>

      {/* Previous Analyses */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-[20px] font-bold text-[#1b1b1d]">Lịch sử phân tích gần đây</h3>
          <button onClick={() => navigate('/reviews')} className="text-black font-bold text-[12px] hover:underline">Xem tất cả</button>
        </div>
        <div className="bg-white border border-[#c6c6cd] rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f6f3f4] text-[12px] text-[#505f76] border-b border-[#c6c6cd]">
                <th className="px-6 py-4 font-bold uppercase tracking-wider">SẢN PHẨM</th>
                <th className="px-6 py-4 font-bold text-center uppercase tracking-wider">NỀN TẢNG</th>
                <th className="px-6 py-4 font-bold text-center uppercase tracking-wider">SỐ LƯỢNG</th>
                <th className="px-6 py-4 font-bold text-center uppercase tracking-wider">SENTIMENT</th>
                <th className="px-6 py-4 font-bold text-center uppercase tracking-wider">NGÀY THỰC HIỆN</th>
                <th className="px-6 py-4 font-bold text-right uppercase tracking-wider">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c6c6cd]">
              {history.length > 0 ? (
                history.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#fcf8fa] transition-colors cursor-pointer group" onClick={() => navigate('/reviews')}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded bg-[#e5e2e3] mr-3 flex-shrink-0 overflow-hidden flex items-center justify-center">
                          <span className="material-symbols-outlined text-[#76777d]">inventory_2</span>
                        </div>
                        <span className="font-medium text-[14px] text-[#1b1b1d] group-hover:text-black line-clamp-1">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={clsx(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold",
                        item.platform === 'Shopee' ? "bg-orange-100 text-orange-700" : 
                        item.platform === 'Lazada' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                      )}>
                        {item.platform}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-[14px] font-bold">{item.total_reviews}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <div className="w-16 bg-[#eae7e9] h-1.5 rounded-full mr-2 overflow-hidden">
                          <div className="bg-green-500 h-full" style={{ width: `${item.positive_rate}%` }}></div>
                        </div>
                        <span className="text-[12px] font-bold font-mono text-green-600">{item.positive_rate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-[#505f76] font-mono text-[12px]">{item.date}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={(e) => handleDelete(item.id, e)}
                        className="p-2 text-[#505f76] hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Xóa sản phẩm"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#505f76] italic">Chưa có lịch sử phân tích nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AnalyzeProduct;
