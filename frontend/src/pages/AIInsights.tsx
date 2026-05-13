import React, { useState, useRef, useEffect } from 'react';
import { chatService, dashboardService } from '../services/api';
import type { Review, DashboardData } from '../types';
import { clsx } from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  sources?: Review[];
  timestamp: Date;
  isError?: boolean;
}

const AIInsights: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);

  // Khởi tạo messages từ localStorage nếu có
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('ai_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Chuyển string timestamp thành Date object
        return parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
      } catch (e) {
        console.error("Error parsing saved messages:", e);
      }
    }
    return [
      {
        id: '1',
        type: 'bot',
        content: 'Chào mừng bạn trở lại! Tôi đã cập nhật dữ liệu từ các đánh giá mới nhất trên Shopee và Lazada. Bạn muốn khám phá điều gì hôm nay?',
        timestamp: new Date()
      }
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lưu messages vào localStorage mỗi khi có thay đổi
  useEffect(() => {
    localStorage.setItem('ai_chat_history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await dashboardService.getDashboardData();
        setData(result);
      } catch (error) {
        console.error("Error fetching insights data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatService.sendMessage(text, messages);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.answer,
        sources: response.sources,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error: any) {
      console.error("Chat error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "### ⚠️ Lỗi kết nối AI\nKhông thể kết nối với mô hình AI (Ollama). Vui lòng đảm bảo ứng dụng Ollama đang chạy trên máy tính của bạn và cổng 11434 đã được mở.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistory = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện? Hành động này không thể hoàn tác.")) return;

    try {
      await chatService.deleteChatHistory();
      
      // Reset local state
      const initialMessage: Message = {
        id: '1',
        type: 'bot',
        content: 'Chào mừng bạn trở lại! Tôi đã cập nhật dữ liệu từ các đánh giá mới nhất trên Shopee và Lazada. Bạn muốn khám phá điều gì hôm nay?',
        timestamp: new Date()
      };
      
      setMessages([initialMessage]);
      localStorage.removeItem('ai_chat_history');
      setShowMenu(false);
    } catch (error) {
      console.error("Delete history error:", error);
      alert("Không thể xóa lịch sử. Vui lòng thử lại sau.");
    }
  };

  const topIssue = data?.top_issues && data.top_issues.length > 0 ? data.top_issues[0] : null;

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">

      <div className="grid grid-cols-12 gap-8 items-stretch">
        {/* Left Side: Data Assistant Panel */}
        <div className="col-span-12 lg:col-span-5 flex flex-col h-full">
          <div className="bg-white border border-[#c6c6cd] rounded-xl shadow-sm flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-[#c6c6cd] flex items-center justify-between bg-[#fcf8fa]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                </div>
                <div>
                  <h3 className="font-bold text-[16px] text-[#1b1b1d]">Trợ lý Phân tích</h3>
                  <p className="text-[10px] text-[#505f76] font-bold uppercase tracking-wider">Analysis Engine Active</p>
                </div>
              </div>
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="text-[#505f76] hover:text-black transition-colors p-1 hover:bg-black/5 rounded-full"
                >
                  <span className="material-symbols-outlined text-[20px]">more_vert</span>
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white/80 backdrop-blur-md border border-[#e2e2e8] rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] z-50 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right ring-1 ring-black/5">
                    <div className="px-4 py-2 border-b border-[#f1f1f4] mb-1">
                      <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">Tùy chọn trợ lý</p>
                    </div>
                    <button 
                      onClick={handleDeleteHistory}
                      className="w-[calc(100%-16px)] mx-2 text-left px-3 py-2.5 text-[13px] text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-3 transition-all duration-200 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                        <span className="material-symbols-outlined text-[18px] text-red-500">delete_sweep</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold">Xóa lịch sử chat</span>
                        <span className="text-[10px] text-red-400 font-medium">Xóa vĩnh viễn log JSON</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Chat History */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto max-h-[550px] p-5 space-y-6 bg-white custom-scrollbar">
              {messages.map((msg) => (
                <div key={msg.id} className={clsx("flex flex-col gap-2", msg.type === 'user' ? "items-end" : "items-start")}>
                  <div className={clsx(
                    "max-w-[85%] p-4 rounded-2xl text-[14px] leading-relaxed markdown-content",
                    msg.type === 'user'
                      ? "bg-black text-white rounded-tr-none shadow-md"
                      : (msg.isError 
                          ? "bg-red-50 text-red-800 rounded-tl-none border border-red-200 shadow-sm"
                          : "bg-[#f6f3f4] text-[#1b1b1d] rounded-tl-none border border-[#c6c6cd]")
                  )}>
                    {msg.isError && (
                      <div className="flex items-center gap-2 mb-2 text-red-600 font-bold border-b border-red-100 pb-2">
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        Lỗi hệ thống
                      </div>
                    )}
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-2" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                        p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                        strong: ({ node, ...props }) => <strong className="font-bold text-inherit" {...props} />,
                        code: ({ node, ...props }) => <code className="bg-black/10 px-1 rounded font-mono text-[12px]" {...props} />
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-1.5 p-4 bg-[#f6f3f4] rounded-2xl w-16">
                  <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              )}
            </div>

            {/* Suggested Questions */}
            <div className="px-4 py-3 border-t border-[#c6c6cd] bg-[#fcf8fa]">
              <p className="text-[11px] font-bold text-[#505f76] mb-2 uppercase tracking-wider">Gợi ý phân tích</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Khách hàng chê gì?", icon: "auto_awesome" },
                  { label: "Sản phẩm đáng mua?", icon: "trending_up" },
                  { label: "Vấn đề đóng gói?", icon: "package_2" }
                ].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q.label)}
                    className="text-[12px] font-bold bg-white border border-[#c6c6cd] px-3 py-1.5 rounded-full hover:bg-black hover:text-white transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">{q.icon}</span>
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 pt-0 bg-[#fcf8fa]">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                  className="w-full bg-white border border-[#c6c6cd] rounded-xl py-3.5 pl-4 pr-12 text-[14px] font-medium focus:ring-2 focus:ring-black outline-none transition-all shadow-inner"
                  placeholder="Hỏi AI về xu hướng khách hàng..."
                />
                <button
                  onClick={() => handleSend(input)}
                  disabled={!input.trim() || loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black text-white w-9 h-9 rounded-lg flex items-center justify-center hover:opacity-90 transition-all active:scale-95 disabled:opacity-30"
                >
                  <span className="material-symbols-outlined text-[20px]">send</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Analytical Answer Cards */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-8 h-full">
          {/* Insight Card 1 */}
          <div className="bg-white border border-[#c6c6cd] rounded-xl shadow-sm overflow-hidden flex flex-col flex-1">
            <div className="p-6 border-b border-[#c6c6cd] bg-[#fcf8fa]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-black/5 p-2.5 rounded-xl border border-[#c6c6cd]">
                    <span className="material-symbols-outlined text-black text-[28px]">troubleshoot</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[18px] text-[#1b1b1d]">Phân tích điểm chạm tiêu cực: "{topIssue?.issue || 'Đang xác định...'}"</h4>
                    <p className="text-[12px] text-[#505f76] font-bold">Dữ liệu từ {topIssue?.count || 0} đánh giá tiêu cực gần đây</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-red-50 px-3 py-1 rounded-full text-red-700 text-[11px] font-black border border-red-100">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                  CẦN XỬ LÝ NGAY
                </div>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
              <div className="space-y-5">
                <p className="text-[14px] leading-relaxed text-[#1b1b1d] font-medium">AI xác định <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-black uppercase tracking-tight">{topIssue?.issue || 'Vấn đề'}</span> là nguyên nhân chính gây sụt giảm mức độ hài lòng của khách hàng.</p>
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-[#505f76] tracking-widest">Bằng chứng điển hình:</p>
                  <div className="bg-[#fcf8fa] p-4 rounded-xl border-l-4 border-black italic text-[13px] relative shadow-sm">
                    <span className="material-symbols-outlined absolute -top-2 -left-2 text-black opacity-10 text-[32px]">format_quote</span>
                    "Tôi không hài lòng vì {topIssue?.issue.toLowerCase() || 'vấn đề phát sinh'}, mong shop sớm cải thiện quy trình."
                  </div>
                </div>
              </div>
              <div className="bg-[#f6f3f4] rounded-xl p-5 flex flex-col justify-between border border-[#c6c6cd]">
                <div>
                  <h5 className="text-[11px] font-black text-[#505f76] mb-4 uppercase tracking-wider">Tác động Sentiment</h5>
                  <div className="flex items-end gap-3 mb-6">
                    <span className="text-[42px] font-bold text-[#ba1a1a] leading-none">-{Math.min(25, (topIssue?.count || 0) * 2)}%</span>
                    <span className="text-red-600 font-black text-[10px] mb-1 uppercase tracking-tight">Mức độ nghiêm trọng cao</span>
                  </div>
                  <p className="text-[12px] text-[#505f76] font-medium leading-relaxed">Đề xuất: Tập trung khắc phục ngay vấn đề {topIssue?.issue.toLowerCase()} để khôi phục rating 5 sao.</p>
                </div>
                <div className="pt-5 border-t border-[#c6c6cd] mt-4">
                  <button className="w-full bg-black text-white py-2.5 rounded-lg text-[13px] font-bold hover:opacity-90 transition-all shadow-md active:scale-95">Xem báo cáo chi tiết</button>
                </div>
              </div>
            </div>
          </div>


          <div className="bg-white border border-[#c6c6cd] rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#c6c6cd] bg-[#fcf8fa] flex items-center gap-3">
              <div className="bg-black/5 p-2.5 rounded-xl border border-[#c6c6cd]">
                <span className="material-symbols-outlined text-black text-[28px]">verified</span>
              </div>
              <div>
                <h4 className="font-bold text-[18px] text-[#1b1b1d]">Lý do chính để khách hàng "Đáng mua"</h4>
                <p className="text-[12px] text-[#505f76] font-bold">Dựa trên {data?.summary.positive || 0} đánh giá tích cực</p>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  { val: '85%', label: 'Chất lượng tốt', icon: 'thumb_up' },
                  { val: '72%', label: 'Giá cạnh tranh', icon: 'payments' },
                  { val: '68%', label: 'Giao hàng nhanh', icon: 'local_shipping' }
                ].map((m, i) => (
                  <div key={i} className="p-4 border border-[#c6c6cd] rounded-xl bg-[#fcf8fa] shadow-sm hover:border-black transition-colors cursor-default">
                    <div className="text-[28px] font-black text-[#1b1b1d] mb-1">{m.val}</div>
                    <div className="text-[10px] font-black text-[#505f76] uppercase flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">{m.icon}</span>
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <p className="text-[14px] italic text-[#505f76] leading-relaxed font-medium">"Khách hàng hiện tại đánh giá cao nhất về chất lượng hoàn thiện của sản phẩm. Sentiment Score tổng thể đạt <span className="text-black font-bold underline">{data?.summary.sentiment_score}%</span>."</p>
                <div className="flex flex-wrap gap-2">
                  {['#Qwen2.5', '#AI_Insights', '#BrandHealth', '#PhoBERT'].map(t => (
                    <span key={t} className="px-2.5 py-1 bg-black text-white text-[10px] rounded-lg font-black tracking-tight">{t}</span>
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

export default AIInsights;
