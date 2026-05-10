import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from pyvi import ViTokenizer
import os

class SentimentService:
    _model = None
    _tokenizer = None
    _device = None

    @classmethod
    def initialize(cls):
        if cls._model is None:
            model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../nlp_training/models/phobert_best"))
            
            if not os.path.exists(model_path):
                print(f"CRITICAL ERROR: Model not found at {model_path}")
                return False

            cls._device = "cuda" if torch.cuda.is_available() else "cpu"
            print(f"Loading Fine-tuned PhoBERT from {model_path} on {cls._device}...")
            
            try:
                cls._tokenizer = AutoTokenizer.from_pretrained(model_path)
                cls._model = AutoModelForSequenceClassification.from_pretrained(model_path)
                
                try:
                    cls._model.to(cls._device)
                    print(f"Model successfully loaded on {cls._device}")
                except Exception as cuda_err:
                    print(f"WARNING: Failed to load model on CUDA: {cuda_err}. Falling back to CPU.")
                    cls._device = "cpu"
                    cls._model.to(cls._device)
                    print("Model loaded on CPU.")

                cls._model.eval()
                print("Model is ready for inference.")
            except Exception as e:
                print(f"FATAL ERROR while loading model: {str(e)}")
                return False
        return True

    @classmethod
    def analyze_sentiment(cls, text, aspect="general"):
        """Phân tích cảm xúc sử dụng mô hình Fine-tuned"""
        if not cls.initialize():
            return {"sentiment": "neutral", "confidence": 0.0}
            
        if not text or len(text.strip()) == 0:
            return {"sentiment": "neutral", "confidence": 0.0}
        
        try:
            # 1. Ghép aspect + text (theo đúng format huấn luyện)
            input_text = f"{aspect.lower()} {text.lower()}"
            
            # 2. Tách từ
            segmented_text = ViTokenizer.tokenize(input_text)
            
            # 3. Tokenize
            inputs = cls._tokenizer(
                segmented_text,
                return_tensors="pt",
                truncation=True,
                padding=True,
                max_length=256
            )
            
            inputs = {k: v.to(cls._device) for k, v in inputs.items()}

            # 4. Dự báo
            with torch.no_grad():
                outputs = cls._model(**inputs)
                probs = F.softmax(outputs.logits, dim=-1)
                pred_id = torch.argmax(probs, dim=-1).item()
            
            sentiment_map = {0: 'negative', 1: 'neutral', 2: 'positive'}
            
            return {
                "sentiment": sentiment_map[pred_id],
                "confidence": round(float(probs[0][pred_id]), 4),
                "probabilities": {
                    "positive": round(float(probs[0][2]), 4),
                    "neutral": round(float(probs[0][1]), 4),
                    "negative": round(float(probs[0][0]), 4)
                }
            }
        except Exception as e:
            print(f"Sentiment analysis error: {str(e)}")
            return {"sentiment": "neutral", "confidence": 0.0}

    @classmethod
    def get_summary(cls, analyzed_reviews):
        if not analyzed_reviews:
            return {"positive": 0, "neutral": 0, "negative": 0, "total": 0, "positive_rate": 0}
            
        total = len(analyzed_reviews)
        positive = sum(1 for r in analyzed_reviews if r.get('sentiment') == 'positive')
        neutral = sum(1 for r in analyzed_reviews if r.get('sentiment') == 'neutral')
        negative = sum(1 for r in analyzed_reviews if r.get('sentiment') == 'negative')
        
        return {
            "positive": positive,
            "neutral": neutral,
            "negative": negative,
            "total": total,
            "positive_rate": round((positive / total) * 100, 2) if total > 0 else 0
        }
