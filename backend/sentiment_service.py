import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from pyvi import ViTokenizer
import os

class SentimentAI:
    def __init__(self, model_path):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"--- Đang tải PhoBERT Model trên thiết bị: {self.device} ---")
        
        # Load model và tokenizer
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_path)
        
        self.model.to(self.device)
        self.model.eval()
        
        self.id2label = {0: "negative", 1: "neutral", 2: "positive"}

    def predict(self, text, aspect="general"):
        # 1. Ghép aspect + sentence (đúng như lúc train)
        input_text = f"{aspect.lower()} {text.lower()}"
        
        # 2. Tách từ bằng PyVi
        segmented_text = ViTokenizer.tokenize(input_text)
        
        # 3. Tokenize
        inputs = self.tokenizer(
            segmented_text,
            return_tensors="pt",
            truncation=True,
            padding=True,
            max_length=256
        )
        
        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        # 4. Dự báo
        with torch.no_grad():
            outputs = self.model(**inputs)
            probs = F.softmax(outputs.logits, dim=-1)
            pred_id = torch.argmax(probs, dim=-1).item()

        return {
            "label": self.id2label[pred_id],
            "confidence": float(probs[0][pred_id]),
            "probabilities": {
                self.id2label[i]: float(probs[0][i]) for i in range(len(self.id2label))
            }
        }
