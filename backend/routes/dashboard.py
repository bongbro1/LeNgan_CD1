from flask import Blueprint, jsonify
from models import Product, Review
from collections import Counter
import datetime
from sqlalchemy import func

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/api/dashboard', methods=['GET'])
def get_dashboard_data():
    # 1. Tổng quan các chỉ số từ Database
    total_reviews = Review.query.count()
    if total_reviews == 0:
        return jsonify({
            "summary": {
                "total_reviews": 0,
                "positive": 0,
                "neutral": 0,
                "negative": 0,
                "average_rating": 0,
                "sentiment_score": 0
            },
            "sentiment_distribution": [],
            "trend_data": [],
            "top_issues": []
        })

    # Đếm các loại cảm xúc
    positive = Review.query.filter_by(sentiment='positive').count()
    neutral = Review.query.filter_by(sentiment='neutral').count()
    negative = Review.query.filter_by(sentiment='negative').count()
    
    avg_rating = db_avg_rating = db_res = Review.query.with_entities(func.avg(Review.rating)).scalar() or 0
    sentiment_score = round((positive / total_reviews) * 100)
    
    # 2. Dữ liệu xu hướng (Trend data) - 7 ngày gần đây
    today = datetime.datetime.utcnow().date()
    trend_data = []
    for i in range(6, -1, -1):
        date = today - datetime.timedelta(days=i)
        start_day = datetime.datetime.combine(date, datetime.time.min)
        end_day = datetime.datetime.combine(date, datetime.time.max)
        
        day_pos = Review.query.filter(Review.sentiment == 'positive', Review.created_at.between(start_day, end_day)).count()
        day_neu = Review.query.filter(Review.sentiment == 'neutral', Review.created_at.between(start_day, end_day)).count()
        day_neg = Review.query.filter(Review.sentiment == 'negative', Review.created_at.between(start_day, end_day)).count()
        
        trend_data.append({
            "date": date.strftime("%Y-%m-%d"),
            "positive": day_pos,
            "neutral": day_neu,
            "negative": day_neg
        })
    
    # 3. Top Issues (Phân tích thực tế từ nội dung review tiêu cực)
    negative_reviews = Review.query.filter_by(sentiment='negative').all()
    
    # Định nghĩa các nhóm vấn đề và từ khóa đi kèm
    issue_categories = {
        "Giao hàng": ["giao hàng", "ship", "lâu", "chậm", "vận chuyển"],
        "Đóng gói": ["đóng gói", "bao bì", "hộp", "móp", "vỡ", "cẩn thận"],
        "Chất lượng": ["chất lượng", "kém", "dỏm", "hư", "lỗi", "không giống", "tệ"],
        "Dịch vụ": ["tư vấn", "phục vụ", "thái độ", "trả lời", "nhắn tin"]
    }
    
    issue_counts = {cat: 0 for cat in issue_categories}
    
    for review in negative_reviews:
        content_lower = (review.content or "").lower()
        for category, keywords in issue_categories.items():
            if any(kw in content_lower for kw in keywords):
                issue_counts[category] += 1
    
    # Chuyển đổi sang format frontend yêu cầu và sắp xếp
    top_issues = []
    for issue, count in issue_counts.items():
        if count > 0:
            impact = "High" if count > (negative * 0.5) else "Medium"
            top_issues.append({
                "issue": issue,
                "count": count,
                "impact": impact
            })
    
    # Sắp xếp theo số lượng giảm dần
    top_issues = sorted(top_issues, key=lambda x: x['count'], reverse=True)
    
    # Nếu không có issue nào từ keyword, lấy một mẫu mặc định nếu có review negative
    if not top_issues and negative > 0:
        top_issues = [{"issue": "Vấn đề khác", "count": negative, "impact": "Medium"}]

    # 4. Đánh giá gần đây
    recent_reviews = Review.query.order_by(Review.created_at.desc()).limit(3).all()

    return jsonify({
        "summary": {
            "total_reviews": total_reviews,
            "positive": positive,
            "neutral": neutral,
            "negative": negative,
            "average_rating": round(avg_rating, 1),
            "sentiment_score": sentiment_score
        },
        "sentiment_distribution": [
            {"name": "Tích cực", "value": positive, "color": "#10B981"},
            {"name": "Trung lập", "value": neutral, "color": "#6366F1"},
            {"name": "Tiêu cực", "value": negative, "color": "#EF4444"}
        ],
        "trend_data": trend_data,
        "top_issues": top_issues,
        "recent_reviews": [r.to_dict() for r in recent_reviews]
    })
