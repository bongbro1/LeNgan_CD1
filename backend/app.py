import sys
import os

# Fix Windows console encoding (cp1252 -> utf-8) to support Vietnamese text
# Use reconfigure() to modify in-place (TextIOWrapper closes the fd and breaks Flask/Click)
os.environ['PYTHONUTF8'] = '1'
os.environ['PYTHONIOENCODING'] = 'utf-8'
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

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
    # use_reloader=False: Tắt watchdog reloader để tránh restart server khi Playwright chạy
    # (Watchdog theo dõi cả thư mục Python system, gây restart giữa request → ERR_CONNECTION_RESET)
    app.run(debug=True, port=5000, use_reloader=False)
