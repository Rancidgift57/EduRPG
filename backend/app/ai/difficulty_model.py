from sklearn.linear_model import LogisticRegression
import numpy as np

class AdaptiveDifficultyModel:
    def __init__(self):
        self.model = LogisticRegression()

    def predict_next_difficulty(
        self, user_history: list[dict]
    ) -> int:  # Returns 1-5
        if not user_history:
            return 2  # Default medium

        recent = user_history[-10:]  # Last 10 answers
        accuracy = sum(h['correct'] for h in recent) / len(recent)
        avg_time = sum(h['response_time'] for h in recent) / len(recent)

        # Simple heuristic + ML hybrid
        if accuracy > 0.85 and avg_time < 10:
            return min(5, recent[-1]['difficulty'] + 1)  # Harder
        elif accuracy < 0.50:
            return max(1, recent[-1]['difficulty'] - 1)  # Easier
        else:
            return recent[-1]['difficulty']  # Same
