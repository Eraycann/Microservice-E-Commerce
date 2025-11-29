# Burada implicit kütüphanesini kullanarak ALS (Alternating Least Squares) algoritmasını çalıştıracağız. Bu algoritma "Bu ürünü alan bunu da aldı" mantığını matematiksel olarak kurar.
import pandas as pd
import scipy.sparse as sparse
import implicit


class RecommenderEngine:
    def __init__(self):
        self.model = implicit.als.AlternatingLeastSquares(
            factors=50,  # Gizli özellik sayısı (Latent factors)
            regularization=0.1,
            iterations=20
        )
        self.user_map = {}  # Keycloak ID -> 0,1,2 (Matris ID)
        self.item_map = {}  # Product ID -> 0,1,2
        self.item_inv_map = {}  # 0,1,2 -> Product ID
        self.sparse_user_item = None

    def train(self, df: pd.DataFrame):
        if df.empty:
            print("Veri yok, model eğitilemedi.")
            return

        # 1. ID'leri sayısal indekslere çevir (Mapping)
        # Unique User ve Product listesi
        users = df['userId'].unique()
        items = df['productId'].unique()

        self.user_map = {u: i for i, u in enumerate(users)}
        self.item_map = {p: i for i, p in enumerate(items)}
        self.item_inv_map = {i: p for i, p in enumerate(items)}

        # DataFrame'deki ID'leri indekse çevir
        df['user_idx'] = df['userId'].map(self.user_map)
        df['item_idx'] = df['productId'].map(self.item_map)

        # 2. Seyrek Matris Oluştur (Sparse Matrix)
        # Satırlar: Kullanıcılar, Sütunlar: Ürünler, Değerler: Skorlar
        self.sparse_user_item = sparse.csr_matrix(
            (df['score'], (df['user_idx'], df['item_idx'])),
            shape=(len(users), len(items))
        )

        # 3. Modeli Eğit
        print("Model eğitimi başlıyor...")
        # implicit kütüphanesi item-user formatı sever, o yüzden transpose alıyoruz
        self.model.fit(self.sparse_user_item)
        print("Model eğitimi tamamlandı!")

    def recommend(self, user_id, n=5):
        # Bilinmeyen kullanıcı kontrolü (Cold Start)
        if user_id not in self.user_map:
            return []  # Java tarafı Fallback yapacak

        user_idx = self.user_map[user_id]

        # Öneri Yap
        # user_items: Kullanıcının zaten etkileşime girdiği ürünler (bunları önerme)
        ids, scores = self.model.recommend(
            user_idx,
            self.sparse_user_item[user_idx],
            N=n,
            filter_already_liked_items=True
        )

        # İndeksleri tekrar Product ID'ye çevir
        recommendations = [self.item_inv_map[item_idx] for item_idx in ids]
        return recommendations


# Global instance (Singleton gibi davranır)
engine = RecommenderEngine()