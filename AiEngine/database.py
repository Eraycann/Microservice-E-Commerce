from pymongo import MongoClient
import pandas as pd
import numpy as np
# 👇 YENİ EKLENDİ: Mongo İzleme Kütüphanesi
from opentelemetry.instrumentation.pymongo import PymongoInstrumentor

# MongoDB Bağlantısı
MONGO_URI = "mongodb://admin:admin@localhost:27017/"
DB_NAME = "ecommerce-recommendation-db"
COLLECTION_NAME = "user_interactions"

# 👇 YENİ EKLENDİ: MongoDB sorgularını otomatik takip et
PymongoInstrumentor().instrument()


def get_interaction_data():
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]

    # GÜNCELLEME: guestId alanını da çekiyoruz
    cursor = collection.find({}, {"userId": 1, "guestId": 1, "productId": 1, "eventType": 1, "_id": 0})
    df = pd.DataFrame(list(cursor))

    # 3. KONTROL: Eğer veri tabanı boşsa boş ama şeması doğru bir DataFrame dön
    if df.empty:
        print("⚠️ Veritabanında henüz etkileşim verisi yok. Boş DataFrame dönülüyor.")
        return pd.DataFrame(columns=['userId', 'guestId', 'productId', 'interactionType', 'final_user_id'])

    # 4. KONTROL: Sütunlar eksikse None olarak ekle
    if 'userId' not in df.columns:
        df['userId'] = None

    if 'guestId' not in df.columns:
        df['guestId'] = None

    # --- ID BİRLEŞTİRME MANTIĞI (Unified ID) ---
    df['userId'] = df['userId'].replace('', np.nan)
    df['final_user_id'] = df['userId'].fillna(df['guestId'])

    # final_user_id'si hala boş olan satırları temizle
    df = df.dropna(subset=['final_user_id'])

    # Event Tiplerini Puana Çevir
    event_weights = {
        "VIEW": 1,
        "ADD_TO_CART": 3,
        "PURCHASE": 5
    }

    # Eğer eventType sütunu yoksa hata vermemesi için kontrol
    if 'eventType' in df.columns:
        df["score"] = df["eventType"].map(event_weights).fillna(1)
    else:
        df["score"] = 1

    # Gruplama
    df_grouped = df.groupby(["final_user_id", "productId"])["score"].sum().reset_index()
    df_grouped.rename(columns={"final_user_id": "userId"}, inplace=True)

    return df_grouped