import datetime
import random

MOCK_REVIEWS = [
    {
        "id": "R001",
        "content": "Sản phẩm tuyệt vời, đóng gói rất cẩn thận và giao hàng nhanh. Sẽ ủng hộ shop tiếp.",
        "rating": 5,
        "sentiment": "positive",
        "confidence": 0.98,
        "date": (datetime.datetime.now() - datetime.timedelta(days=1)).strftime("%Y-%m-%d"),
        "platform": "Shopee"
    },
    {
        "id": "R002",
        "content": "Máy dùng ổn trong tầm giá, nhưng pin hơi nhanh hết. Mong shop cải thiện.",
        "rating": 4,
        "sentiment": "neutral",
        "confidence": 0.75,
        "date": (datetime.datetime.now() - datetime.timedelta(days=2)).strftime("%Y-%m-%d"),
        "platform": "Shopee"
    },
    {
        "id": "R003",
        "content": "Giao hàng quá chậm, hộp bị móp méo làm ảnh hưởng đến máy bên trong. Rất thất vọng.",
        "rating": 1,
        "sentiment": "negative",
        "confidence": 0.95,
        "date": (datetime.datetime.now() - datetime.timedelta(days=3)).strftime("%Y-%m-%d"),
        "platform": "Lazada"
    },
    {
        "id": "R004",
        "content": "Chất lượng sản phẩm tạm được, không quá xuất sắc như quảng cáo.",
        "rating": 3,
        "sentiment": "neutral",
        "confidence": 0.82,
        "date": (datetime.datetime.now() - datetime.timedelta(days=4)).strftime("%Y-%m-%d"),
        "platform": "Tiki"
    },
    {
        "id": "R005",
        "content": "Nhân viên tư vấn nhiệt tình, giải đáp thắc mắc nhanh chóng. 5 sao cho dịch vụ.",
        "rating": 5,
        "sentiment": "positive",
        "confidence": 0.97,
        "date": (datetime.datetime.now() - datetime.timedelta(days=5)).strftime("%Y-%m-%d"),
        "platform": "Shopee"
    },
    {
        "id": "R006",
        "content": "Hàng lỗi không dùng được, nhắn tin cho shop thì không thấy hồi âm. Đừng ai mua nhé.",
        "rating": 1,
        "sentiment": "negative",
        "confidence": 0.99,
        "date": (datetime.datetime.now() - datetime.timedelta(days=1)).strftime("%Y-%m-%d"),
        "platform": "Shopee"
    },
    {
        "id": "R007",
        "content": "Giá cả phải chăng, hàng giống hình. Giao hàng hơi lâu một chút.",
        "rating": 4,
        "sentiment": "positive",
        "confidence": 0.88,
        "date": (datetime.datetime.now() - datetime.timedelta(days=2)).strftime("%Y-%m-%d"),
        "platform": "Lazada"
    },
    {
        "id": "R008",
        "content": "Màu sắc không đúng như mô tả, cảm giác nhựa hơi rẻ tiền.",
        "rating": 2,
        "sentiment": "negative",
        "confidence": 0.85,
        "date": (datetime.datetime.now() - datetime.timedelta(days=3)).strftime("%Y-%m-%d"),
        "platform": "Tiki"
    },
    {
        "id": "R009",
        "content": "Dùng rất thích, cảm ứng nhạy và màn hình đẹp.",
        "rating": 5,
        "sentiment": "positive",
        "confidence": 0.96,
        "date": (datetime.datetime.now() - datetime.timedelta(days=0)).strftime("%Y-%m-%d"),
        "platform": "Shopee"
    },
    {
        "id": "R010",
        "content": "Giao thiếu phụ kiện, phải đợi đổi trả mất thời gian.",
        "rating": 2,
        "sentiment": "negative",
        "confidence": 0.92,
        "date": (datetime.datetime.now() - datetime.timedelta(days=1)).strftime("%Y-%m-%d"),
        "platform": "Shopee"
    }
]

# Generate more mock data for trend charts
for i in range(11, 100):
    sentiment = random.choice(["positive", "neutral", "negative"])
    rating = 5 if sentiment == "positive" else (3 if sentiment == "neutral" else 1)
    if random.random() > 0.7:
        rating = random.randint(1, 5)
    
    MOCK_REVIEWS.append({
        "id": f"R{i:03d}",
        "content": f"Review nội dung giả lập số {i} cho mục đích demo.",
        "rating": rating,
        "sentiment": sentiment,
        "confidence": round(random.uniform(0.6, 0.99), 2),
        "date": (datetime.datetime.now() - datetime.timedelta(days=random.randint(0, 30))).strftime("%Y-%m-%d"),
        "platform": random.choice(["Shopee", "Lazada", "Tiki"])
    })

MOCK_PRODUCT = {
    "id": "P001",
    "name": "Điện thoại Samsung Galaxy A55 5G (8GB/128GB)",
    "platform": "Shopee",
    "url": "https://shopee.vn/dien-thoai-samsung-galaxy-a55-5g-i.12345678"
}

TOP_ISSUES = [
    {"issue": "Pin yếu", "count": 25, "sentiment": "negative"},
    {"issue": "Giao hàng chậm", "count": 18, "sentiment": "negative"},
    {"issue": "Đóng gói kém", "count": 12, "sentiment": "negative"},
    {"issue": "Hàng lỗi", "count": 10, "sentiment": "negative"},
    {"issue": "Giá tốt", "count": 45, "sentiment": "positive"},
    {"issue": "Tư vấn nhiệt tình", "count": 30, "sentiment": "positive"}
]
