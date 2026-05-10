from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String(500), unique=True, nullable=False)
    name = db.Column(db.String(200))
    platform = db.Column(db.String(50))
    last_analyzed = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Quan hệ với bảng Review
    reviews = db.relationship('Review', backref='product', lazy=True, cascade="all, delete-orphan")

class Review(db.Model):
    __tablename__ = 'reviews'
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    sentiment = db.Column(db.String(20), nullable=False)
    confidence = db.Column(db.Float, default=0.0)
    rating = db.Column(db.Integer)
    author = db.Column(db.String(100))
    platform = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "content": self.content,
            "sentiment": self.sentiment,
            "confidence": self.confidence,
            "rating": self.rating,
            "author": self.author,
            "platform": self.platform,
            "date": self.created_at.strftime("%Y-%m-%d %H:%M:%S")
        }
