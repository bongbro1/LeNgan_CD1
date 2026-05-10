from flask import Flask
from flask_cors import CORS
from routes.dashboard import dashboard_bp
from routes.reviews import reviews_bp
from routes.analyze import analyze_bp
from routes.chat import chat_bp

from models import db

app = Flask(__name__)
CORS(app) # Enable CORS for frontend

# Configure SQLite Database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///reviews.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize DB
db.init_app(app)

with app.app_context():
    db.create_all()

# Register Blueprints
app.register_blueprint(dashboard_bp)
app.register_blueprint(reviews_bp)
app.register_blueprint(analyze_bp)
app.register_blueprint(chat_bp)

@app.route('/api/health', methods=['GET'])
def health_check():
    return {"status": "ok", "message": "Server is running"}

if __name__ == '__main__':
    app.run(debug=True, port=5000)
