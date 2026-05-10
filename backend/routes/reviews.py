from flask import Blueprint, jsonify, request
from models import Review

reviews_bp = Blueprint('reviews', __name__)

@reviews_bp.route('/api/reviews', methods=['GET'])
def get_reviews():
    sentiment = request.args.get('sentiment')
    rating = request.args.get('rating')
    platform = request.args.get('platform')
    search = request.args.get('search', '').lower()
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    
    # Bắt đầu truy vấn từ Database
    query = Review.query
    
    if sentiment:
        query = query.filter(Review.sentiment == sentiment)
    
    if rating:
        query = query.filter(Review.rating == int(rating))
        
    if platform:
        query = query.filter(Review.platform.ilike(f"%{platform}%"))
        
    if search:
        query = query.filter(Review.content.ilike(f"%{search}%"))
        
    # Sắp xếp mới nhất lên đầu
    query = query.order_by(Review.created_at.desc())
    
    # Phân trang
    pagination = query.paginate(page=page, per_page=limit, error_out=False)
    
    return jsonify({
        "reviews": [r.to_dict() for r in pagination.items],
        "total": pagination.total,
        "page": page,
        "limit": limit,
        "total_pages": pagination.pages
    })
