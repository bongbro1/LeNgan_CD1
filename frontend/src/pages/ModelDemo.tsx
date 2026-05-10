import React, { useState } from 'react';
import { analyzeService } from '../services/api';
import { clsx } from 'clsx';

const ModelDemo: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const examples = [
    "Shop giao nhanh, sản phẩm rất tốt",
    "Sản phẩm lỗi, pin yếu",
    "Dùng tạm ổn trong tầm giá"
  ];

  const handlePredict = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeService.predictSentiment(inputText);
      setResult(data);
    } catch (error: any) {
      console.error("Prediction failed:", error);
      setError("Không thể phân tích văn bản. Mô hình PhoBERT có thể chưa được nạp hoặc đang bận.");
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'sentiment_very_satisfied';
      case 'negative': return 'sentiment_very_dissatisfied';
      default: return 'sentiment_neutral';
    }
  };

  const getSentimentLabel = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'Tích cực';
      case 'negative': return 'Tiêu cực';
      default: return 'Trung tính';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-blue-500';
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[30px] font-bold text-[#1b1b1d] leading-[38px]">Demo mô hình Phân tích</h1>
          <p className="text-[#505f76] text-[16px] mt-2">Thử nghiệm trực tiếp khả năng xử lý ngôn ngữ tự nhiên trên các đánh giá thương mại điện tử.</p>
        </div>
        <div className="flex items-center">
          <span className="text-[12px] font-bold text-[#505f76] bg-[#f0edee] px-4 py-1.5 rounded-full uppercase tracking-wider border border-[#c6c6cd]">
            Model: BERT-Sentiment-V3
          </span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Prediction Panel */}
        <div className="col-span-12 lg:col-span-7 bg-white rounded-xl border border-[#c6c6cd] shadow-sm p-6 flex flex-col  h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[20px] font-bold text-[#1b1b1d]">Nhập đánh giá</h3>
            <span className="material-symbols-outlined text-[#76777d]" data-icon="edit_note">edit_note</span>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full h-48 p-4 bg-[#f6f3f4] border border-[#c6c6cd] rounded-xl focus:ring-2 focus:ring-black outline-none text-[16px] resize-none placeholder:text-[#c6c6cd]"
            placeholder="Nhập nội dung đánh giá của khách hàng tại đây để phân tích..."
          />

          <div className="mt-6">
            <p className="text-[12px] font-bold text-[#505f76] mb-3 uppercase tracking-wider">Ví dụ nhanh:</p>
            <div className="flex flex-wrap gap-2">
              {examples.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setInputText(ex)}
                  className="px-4 py-2 bg-white hover:bg-[#f6f3f4] text-[#505f76] text-[14px] font-medium rounded-lg border border-[#c6c6cd] transition-all active:scale-95"
                >
                  "{ex}"
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handlePredict}
            disabled={loading || !inputText.trim()}
            className="w-full bg-black text-white py-4 rounded-xl font-bold text-[16px] hover:opacity-90 transition-all flex items-center justify-center space-x-2 mt-8 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-spin material-symbols-outlined" data-icon="progress_activity">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined" data-icon="auto_awesome">auto_awesome</span>
            )}
            <span>{loading ? "Đang xử lý..." : "Dự đoán cảm xúc"}</span>
          </button>
        </div>

        {/* Result Card */}
        <div className="col-span-12 lg:col-span-5 flex flex-col space-y-6">
          <div className="bg-white rounded-xl border border-[#c6c6cd] shadow-sm p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <span className="material-symbols-outlined text-red-600 mt-0.5">error</span>
                <div>
                  <p className="text-red-800 text-[14px] font-bold">Lỗi xử lý</p>
                  <p className="text-red-700 text-[13px]">{error}</p>
                </div>
              </div>
            )}

            {result ? (
              <div className="space-y-8 animate-in zoom-in-95 duration-500">
                <div className="flex flex-col items-center justify-center py-8 bg-[#f6f3f4] rounded-xl border border-[#c6c6cd]">
                  <div className="w-20 h-20 bg-white rounded-full shadow-md flex items-center justify-center mb-4 border border-[#c6c6cd]">
                    <span className={clsx("material-symbols-outlined text-[48px]", getSentimentColor(result.sentiment))} style={{ fontVariationSettings: "'FILL' 1" }}>
                      {getSentimentIcon(result.sentiment)}
                    </span>
                  </div>
                  <p className={clsx("text-[24px] font-bold", getSentimentColor(result.sentiment))}>{getSentimentLabel(result.sentiment)}</p>
                  <p className="text-[#505f76] text-[14px] mt-1">Nội dung có sắc thái {getSentimentLabel(result.sentiment).toLowerCase()}</p>
                </div>

                <div className="space-y-5">
                  {[
                    { key: 'positive', label: 'Tích cực (Positive)', color: 'bg-green-500' },
                    { key: 'neutral', label: 'Trung tính (Neutral)', color: 'bg-blue-400' },
                    { key: 'negative', label: 'Tiêu cực (Negative)', color: 'bg-red-500' }
                  ].map((item) => (
                    <div key={item.key}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-[12px] font-bold text-[#1b1b1d]">{item.label}</span>
                        <span className="text-[12px] font-mono font-bold text-[#505f76]">
                          {(result.probabilities[item.key] * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-[#eae7e9] rounded-full overflow-hidden">
                        <div
                          className={clsx("h-full rounded-full transition-all duration-1000", item.color)}
                          style={{ width: `${result.probabilities[item.key] * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[380px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-[#c6c6cd] rounded-xl">
                <span className="material-symbols-outlined text-[48px] text-[#c6c6cd] mb-4" data-icon="psychology">psychology</span>
                <p className="text-[#505f76] text-[14px] font-medium">Nhập văn bản và nhấn nút phân tích để xem kết quả chi tiết từ mô hình PhoBERT.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Footer Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: 'speed', label: 'Thời gian xử lý', value: result ? `${result.processing_time}ms` : '-- ms' },
          { icon: 'memory', label: 'Phiên bản Logic', value: result ? result.model_version : 'Transformer v4.2' },
          { icon: 'verified_user', label: 'Tỉ lệ chính xác (F1)', value: result ? result.accuracy_f1 : '0.88' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-[#c6c6cd] shadow-sm flex items-center">
            <div className="w-12 h-12 rounded-lg bg-[#f0edee] flex items-center justify-center mr-4 text-black border border-[#c6c6cd]">
              <span className="material-symbols-outlined" data-icon={stat.icon}>{stat.icon}</span>
            </div>
            <div>
              <p className="text-[11px] text-[#505f76] font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-[20px] font-mono font-bold text-[#1b1b1d]">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModelDemo;
