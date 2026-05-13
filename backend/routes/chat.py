from flask import Blueprint, jsonify, request
from models import Review, db
import requests
import json
import os

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/api/chat', methods=['POST'])
def chat_with_data():
    data = request.json
    message = data.get('message', '')
    history = data.get('history', []) # Nhận lịch sử từ frontend
    
    # 1. Lấy dữ liệu thực tế từ Database
    reviews = Review.query.order_by(Review.created_at.desc()).limit(50).all()
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
    
    # Chuẩn bị ngữ cảnh cho AI (Tăng lên 25 review để tra cứu tốt hơn)
    reviews_context = "\n".join([f"- [{r.sentiment}] {r.content}" for r in reviews[:25]])
    
    # 2. Gọi API Ollama (Sử dụng /api/chat để có trí nhớ tốt hơn)
    try:
        ollama_url = "http://localhost:11434/api/chat"
        
        # Tạo System message với chỉ dẫn gắn chặt dữ liệu
        system_content = f"""Bạn là Aura - Trợ lý AI Phân tích dữ liệu.
DƯỚI ĐÂY LÀ DỮ LIỆU TRONG HỆ THỐNG CỦA NGƯỜI DÙNG (BẠN PHẢI SỬ DỤNG NÓ):
- Tổng số đánh giá: {total} bản ghi.
- Thống kê: {pos_pct}% Tích cực, {neg_pct}% Tiêu cực.
- Các đánh giá chi tiết (Dùng để trả lời khi khách hỏi "chê gì", "khen gì", "vấn đề gì"):
{reviews_context}

QUY TẮC HÀNH VI:
1. LUÔN ƯU TIÊN DỮ LIỆU: Khi người dùng hỏi về "khách hàng", "hệ thống", "đánh giá", bạn PHẢI tra cứu dữ liệu trên để trả lời. Đừng trả lời lý thuyết chung chung.
2. TIẾNG VIỆT 100%: Tuyệt đối không dùng tiếng Trung.
3. LINH HOẠT NHƯNG CHÍNH XÁC: Bạn vẫn có thể tán gẫu về giá vàng hay xã hội, nhưng nếu câu hỏi liên quan đến sản phẩm/hệ thống, dữ liệu trên là nguồn duy nhất và chính xác nhất.
4. ĐỊNH DANH: Khi người dùng nói "trong hệ thống của tôi", họ đang nói về dữ liệu bạn đang nắm giữ ở trên.
"""
        
        # Xây dựng mảng messages bao gồm lịch sử
        messages_for_ollama = [{"role": "system", "content": system_content}]
        
        # Thêm lịch sử chat vào (giới hạn 6 câu gần nhất để tránh quá tải token)
        for h in history[-6:]:
            role = "user" if h['type'] == 'user' else "assistant"
            messages_for_ollama.append({"role": role, "content": h['content']})
        
        # Thêm câu hỏi hiện tại nếu chưa có trong history
        if not history or history[-1]['content'] != message:
            messages_for_ollama.append({"role": "user", "content": message})

        payload = {
            "model": "qwen2.5:3b",
            "messages": messages_for_ollama,
            "stream": False,
            "options": {
                "temperature": 0.8,
                "num_predict": 1024
            }
        }
        
        print(f"DEBUG: Calling Ollama Chat API")
        response = requests.post(ollama_url, json=payload, timeout=60)
        
        if response.status_code == 200:
            result = response.json()
            answer = result.get('message', {}).get('content', 'Xin lỗi, tôi gặp lỗi khi xử lý câu trả lời.')
        else:
            answer = f"Ollama Error (HTTP {response.status_code})."
            
    except requests.exceptions.ConnectionError:
        print("DEBUG: Connection Error - Is Ollama running?")
        answer = "Không thể kết nối tới Ollama. Hãy đảm bảo bạn đã chạy 'ollama serve' và cổng 11434 đang mở."
    except Exception as e:
        print(f"DEBUG: Unexpected Ollama Error: {type(e).__name__} - {str(e)}")
        answer = f"Lỗi hệ thống khi gọi AI: {str(e)}."

    # 3. Lấy nguồn tham khảo thực tế (Sources)
    sources = [r.to_dict() for r in reviews[:3]]

    # 4. Lưu lịch sử vào file JSON
    try:
        log_dir = "logs"
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)
            
        history_file = os.path.join(log_dir, "chat_history.json")
        history_data = []
        
        if os.path.exists(history_file):
            with open(history_file, 'r', encoding='utf-8') as f:
                try:
                    history_data = json.load(f)
                except:
                    history_data = []
        
        # Thêm bản ghi mới
        import datetime
        new_entry = {
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "user_message": message,
            "ai_answer": answer,
            "product_stats": {
                "total": total,
                "pos_pct": pos_pct,
                "neg_pct": neg_pct
            }
        }
        history_data.append(new_entry)
        
        with open(history_file, 'w', encoding='utf-8') as f:
            json.dump(history_data, f, ensure_ascii=False, indent=4)
            
        print(f"DEBUG: Saved chat history to {history_file}")
    except Exception as e:
        print(f"DEBUG: Failed to save history: {str(e)}")
    
    return jsonify({
        "answer": answer,
        "sources": sources
    })

@chat_bp.route('/api/chat/history', methods=['DELETE'])
def delete_chat_history():
    """Xóa file lịch sử chat JSON"""
    try:
        history_file = os.path.join("logs", "chat_history.json")
        if os.path.exists(history_file):
            os.remove(history_file)
            return jsonify({"status": "success", "message": "Đã xóa lịch sử chat."})
        else:
            return jsonify({"status": "success", "message": "Không có lịch sử để xóa."})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
