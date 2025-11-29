import pandas as pd
import scipy.sparse as sparse
import implicit
import pickle
import os

# Modelin kaydedileceği dosya yolu
MODEL_PATH = "model.pkl"

class RecommenderEngine:
    def __init__(self):
        # Modeli başlat ama henüz eğitme
        self.model = implicit.als.AlternatingLeastSquares(
            factors=50,
            regularization=0.1,
            iterations=20
        )
        self.user_map = {}
        self.item_map = {}
        self.item_inv_map = {}
        self.sparse_user_item = None
        self.is_trained = False  # Modelin eğitim durumu

    def train(self, df: pd.DataFrame):
        if df.empty:
            print("❌ Veri yok, model eğitilemedi.")
            return

        print("🔄 Veri işleniyor...")
        users = df['userId'].unique()
        items = df['productId'].unique()

        self.user_map = {u: i for i, u in enumerate(users)}
        self.item_map = {p: i for i, p in enumerate(items)}
        self.item_inv_map = {i: p for i, p in enumerate(items)}

        df['user_idx'] = df['userId'].map(self.user_map)
        df['item_idx'] = df['productId'].map(self.item_map)

        self.sparse_user_item = sparse.csr_matrix(
            (df['score'], (df['user_idx'], df['item_idx'])),
            shape=(len(users), len(items))
        )

        print("🚀 Model eğitimi başlıyor...")
        self.model.fit(self.sparse_user_item)
        self.is_trained = True
        print("✅ Model eğitimi tamamlandı!")

        # Eğitilen modeli diske kaydet
        self.save_model()

    def recommend(self, user_id, n=5):
        if not self.is_trained:
            print("⚠️ Model henüz eğitilmedi.")
            return []

        if user_id not in self.user_map:
            return []

        user_idx = self.user_map[user_id]

        ids, scores = self.model.recommend(
            user_idx,
            self.sparse_user_item[user_idx],
            N=n,
            filter_already_liked_items=True
        )

        recommendations = [self.item_inv_map[item_idx] for item_idx in ids]
        return recommendations

    # --- YENİ EKLENEN METOTLAR (SAVE/LOAD) ---

    def save_model(self):
        """Modeli ve haritaları diske kaydeder."""
        try:
            with open(MODEL_PATH, 'wb') as f:
                pickle.dump({
                    'model': self.model,
                    'user_map': self.user_map,
                    'item_map': self.item_map,
                    'item_inv_map': self.item_inv_map,
                    'sparse_user_item': self.sparse_user_item,
                    'is_trained': True
                }, f)
            print(f"💾 Model '{MODEL_PATH}' dosyasına kaydedildi.")
        except Exception as e:
            print(f"❌ Model kaydedilirken hata oluştu: {e}")

    def load_model(self):
        """Varsa kayıtlı modeli yükler."""
        if os.path.exists(MODEL_PATH):
            print(f"📂 Kayıtlı model bulundu: {MODEL_PATH}. Yükleniyor...")
            try:
                with open(MODEL_PATH, 'rb') as f:
                    data = pickle.load(f)
                    self.model = data['model']
                    self.user_map = data['user_map']
                    self.item_map = data['item_map']
                    self.item_inv_map = data['item_inv_map']
                    self.sparse_user_item = data['sparse_user_item']
                    self.is_trained = True
                print("✅ Model başarıyla yüklendi. Hazır!")
                return True
            except Exception as e:
                print(f"❌ Model yüklenirken hata oluştu (Dosya bozuk olabilir): {e}")
                return False
        else:
            print("⚠️ Kayıtlı model bulunamadı.")
            return False

engine = RecommenderEngine()