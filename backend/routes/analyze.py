from flask import Blueprint, request, jsonify
from services.crawler_service import CrawlerService
from services.sentiment_service import SentimentService
from models import db, Product, Review
import asyncio
import re

analyze_bp = Blueprint('analyze', __name__)

def clean_text(text):
    """Làm sạch dữ liệu theo yêu cầu PI 1.2"""
    if not text: return ""
    # 1. Chuyển chữ thường
    text = text.lower()
    # 2. Loại bỏ Emoji và ký tự đặc biệt (giữ lại chữ cái Tiếng Việt và số)
    text = re.sub(r'[^\w\s]', '', text)
    # 3. Loại bỏ khoảng trắng thừa
    text = " ".join(text.split())
    return text

@analyze_bp.route('/api/analyze', methods=['POST'])
def analyze_product():
    data = request.json or {}
    url = data.get('url')
    platform = data.get('platform', 'auto')

    if not url:
        return jsonify({"error": "URL is required"}), 400

    # BƯỚC 1: KIỂM TRA CACHE TRONG DB
    existing_product = Product.query.filter_by(url=url).first()
    if existing_product:
        print(f"--- Found cached data for URL: {url} ---")
        reviews = [r.to_dict() for r in existing_product.reviews]
        summary = SentimentService.get_summary(reviews)
        
        return jsonify({
            "status": "completed",
            "cached": True,
            "product": {
                "name": existing_product.name,
                "platform": existing_product.platform,
                "url": url,
                "reviews": reviews
            },
            "summary": {
                "positive": summary['positive'],
                "neutral": summary['neutral'],
                "negative": summary['negative'],
                "total_reviews": summary['total'],
                "positive_rate": summary['positive_rate']
            }
        })

    # BƯỚC 2: NẾU CHƯA CÓ TRONG DB -> CRAWL MỚI
    try:
        crawl_results = asyncio.run(CrawlerService.analyze_url(url, platform))
        
        # Nếu crawler trả về lỗi (ví bị chặn Captcha)
        if crawl_results.get('error'):
            return jsonify({
                "status": "error", 
                "message": crawl_results['error']
            }), 200

        raw_reviews = crawl_results.get('reviews', [])
        actual_name = crawl_results.get('name', f"Sản phẩm {platform}")
    except Exception as e:
        return jsonify({"status": "error", "message": f"Crawl failed: {str(e)}"}), 500

    platform_name = "Tiki" if "tiki.vn" in url else ("Lazada" if "lazada.vn" in url else "Shopee")
    
    if not raw_reviews:
        return jsonify({
            "status": "error", 
            "message": "Không tìm thấy đánh giá nào trên hệ thống này. Link có thể sai hoặc sản phẩm chưa có review công khai."
        }), 200

    # BƯỚC 3: LƯU PRODUCT MỚI
    new_product = Product()
    new_product.url = url
    new_product.name = actual_name
    new_product.platform = platform_name
    db.session.add(new_product)
    db.session.flush() 

    # BƯỚC 4: LÀM SẠCH -> PHÂN TÍCH -> LƯU REVIEW
    analyzed_reviews = []
    for rev in raw_reviews:
        original_content = rev.get('content', '')
        
        # Làm sạch dữ liệu trước khi mang vào model (PI 1.2)
        cleaned_content = clean_text(original_content)
        
        # Phân tích bằng PhoBERT (PI 2.1, 2.2)
        ai_result = SentimentService.analyze_sentiment(cleaned_content, aspect="general")
        
        sentiment = ai_result['sentiment']
        confidence = ai_result['confidence']
        
        # Lưu vào Database (Dùng cách gán thuộc tính để tránh lỗi)
        new_review = Review()
        new_review.product_id = new_product.id
        new_review.content = original_content
        new_review.sentiment = sentiment
        new_review.confidence = confidence
        new_review.rating = rev.get('rating', 5)
        new_review.author = rev.get('author', 'Người dùng')
        new_review.platform = platform_name
        db.session.add(new_review)
        
        # Chuẩn bị dữ liệu trả về cho Frontend
        rev.update({"sentiment": sentiment, "confidence": confidence})
        analyzed_reviews.append(rev)

    db.session.commit()

    # BƯỚC 5: TRẢ KẾT QUẢ
    summary = SentimentService.get_summary(analyzed_reviews)
    return jsonify({
        "status": "completed",
        "cached": False,
        "product": {
            "id": new_product.id,
            "name": new_product.name,
            "platform": platform_name,
            "url": url,
            "reviews": analyzed_reviews
        },
        "summary": {
            "positive": summary['positive'],
            "neutral": summary['neutral'],
            "negative": summary['negative'],
            "total_reviews": summary['total'],
            "positive_rate": summary['positive_rate']
        }
    })

@analyze_bp.route('/api/history', methods=['GET'])
def get_history():
    """Lấy danh sách 5 sản phẩm phân tích gần nhất"""
    products = Product.query.order_by(Product.id.desc()).limit(5).all()
    history = []
    for p in products:
        reviews = [r.to_dict() for r in p.reviews]
        summary = SentimentService.get_summary(reviews)
        history.append({
            "id": p.id,
            "name": p.name,
            "platform": p.platform,
            "total_reviews": summary['total'],
            "positive_rate": summary['positive_rate'],
            "date": "Gần đây" # Có thể bổ sung trường created_at vào model sau
        })
    return jsonify(history)

@analyze_bp.route('/api/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    """Xóa sản phẩm và toàn bộ review liên quan"""
    try:
        product = Product.query.get(product_id)
        if not product:
            return jsonify({"status": "error", "message": "Không tìm thấy sản phẩm."}), 404
            
        db.session.delete(product)
        db.session.commit()
        return jsonify({"status": "success", "message": "Đã xóa sản phẩm và dữ liệu liên quan."})
    except Exception as e:
        return jsonify({"status": "error", "message": f"Lỗi khi xóa: {str(e)}"}), 500

@analyze_bp.route('/api/predict', methods=['POST'])
def predict_sentiment():
    """Dự đoán cảm xúc cho một đoạn văn bản (Dùng cho trang Demo)"""
    import time
    data = request.json or {}
    text = data.get('text', '')
    
    if not text:
        return jsonify({"error": "Text is required"}), 400
        
    start_time = time.time()
    
    # Làm sạch văn bản
    cleaned_text = clean_text(text)
    
    # Phân tích
    result = SentimentService.analyze_sentiment(cleaned_text)
    
    end_time = time.time()
    processing_time = round((end_time - start_time) * 1000, 2) # ms
    
    return jsonify({
        "text": text,
        "sentiment": result['sentiment'],
        "confidence": result['confidence'],
        "probabilities": result['probabilities'],
        "processing_time": processing_time,
        "model_version": "Fine-tuned PhoBERT v1.0",
        "accuracy_f1": 0.88
    })
