from flask import Blueprint, jsonify, request
from models import Review, db
import requests
import json

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/api/chat', methods=['POST'])
def chat_with_data():
    data = request.json
    message = data.get('message', '')
    
    # 1. Lấy dữ liệu thực tế từ Database
    reviews = Review.query.order_by(Review.created_at.desc()).limit(30).all()
    total = Review.query.count()
    
    if total == 0:
        return jsonify({
            "answer": "Hiện tại hệ thống chưa có dữ liệu đánh giá nào để phân tích. Bạn hãy thực hiện phân tích sản phẩm trước nhé!",
            "sources": []
        })

    # Tính toán thống kê nhanh cho Prompt
    positive = Review.query.filter_by(sentiment='positive').count()
    negative = Review.query.filter_by(sentiment='negative').count()
    pos_pct = round((positive / total) * 100, 1)
    neg_pct = round((negative / total) * 100, 1)
    
    # Chuẩn bị ngữ cảnh cho AI
    reviews_context = "\n".join([f"- [{r.sentiment}] {r.content}" for r in reviews[:15]])
    
    prompt = f"""<system>
Bạn là một Chuyên gia Phân tích Dữ liệu Khách hàng cao cấp. Nhiệm vụ của bạn là giải đáp các thắc mắc về sản phẩm dựa TRÊN DỮ LIỆU THỰC TẾ được cung cấp bên dưới.

QUY TẮC BẮT BUỘC:
1. CHỈ TRẢ LỜI BẰNG TIẾNG VIỆT. TUYỆT ĐỐI KHÔNG SỬ DỤNG TIẾNG TRUNG HAY BẤT KỲ NGÔN NGỮ NÀO KHÁC.
2. Trả lời đúng trọng tâm câu hỏi, sử dụng các con số thống kê được cung cấp.
3. Nếu không có thông tin trong dữ liệu, hãy nói rõ là "Dữ liệu hiện tại không đề cập đến vấn đề này" thay vì tự suy diễn.
4. Trình bày rõ ràng bằng các gạch đầu dòng (bullet points).
</system>

<data>
THỐNG KÊ TỔNG QUAN:
- Tổng số lượng đánh giá: {total} bản ghi.
- Tỉ lệ Tích cực: {pos_pct}% (Khách hàng hài lòng).
- Tỉ lệ Tiêu cực: {neg_pct}% (Khách hàng phàn nàn).

CÁC ĐÁNH GIÁ TIÊU BIỂU TỪ KHÁCH HÀNG:
{reviews_context}
</data>

CÂU HỎI CỦA NGƯỜI DÙNG: "{message}"

HÃY PHÂN TÍCH VÀ TRẢ LỜI:"""

    try:
        # 2. Gọi API Ollama
        ollama_url = "http://localhost:11434/api/generate"
        payload = {
            "model": "qwen2.5:3b",
            "prompt": prompt,
            "stream": False
        }
        
        print(f"DEBUG: Calling Ollama at {ollama_url}")
        print(f"DEBUG: Model: {payload['model']}")
        
        response = requests.post(
            ollama_url,
            json=payload,
            timeout=40
        )
        
        print(f"DEBUG: Ollama Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            answer = result.get('response', 'Xin lỗi, tôi gặp lỗi khi xử lý câu trả lời.')
        else:
            print(f"DEBUG: Ollama Error Response: {response.text}")
            answer = f"Ollama trả về lỗi (HTTP {response.status_code}). Hãy kiểm tra xem model 'qwen2.5:latest' đã được pull chưa."
            
    except requests.exceptions.ConnectionError:
        print("DEBUG: Connection Error - Is Ollama running?")
        answer = "Không thể kết nối tới Ollama. Hãy đảm bảo bạn đã chạy 'ollama serve' và cổng 11434 đang mở."
    except Exception as e:
        print(f"DEBUG: Unexpected Ollama Error: {type(e).__name__} - {str(e)}")
        answer = f"Lỗi hệ thống khi gọi AI: {str(e)}."

    # 3. Lấy nguồn tham khảo thực tế (Sources)
    sources = [r.to_dict() for r in reviews[:3]]
    
    return jsonify({
        "answer": answer,
        "sources": sources
    })
