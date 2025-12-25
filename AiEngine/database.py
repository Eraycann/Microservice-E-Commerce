from pymongo import MongoClient
import pandas as pd
import numpy as np # Eklendi

# MongoDB Bağlantısı
MONGO_URI = "mongodb://admin:admin@localhost:27017/"
DB_NAME = "ecommerce-recommendation-db"
COLLECTION_NAME = "user_interactions"


def get_interaction_data():
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]

    # GÜNCELLEME: guestId alanını da çekiyoruz
    cursor = collection.find({}, {"userId": 1, "guestId": 1, "productId": 1, "eventType": 1, "_id": 0})
    df = pd.DataFrame(list(cursor))

    if df.empty:
        return pd.DataFrame(columns=["userId", "productId", "score"])

    # --- ID BİRLEŞTİRME MANTIĞI (Unified ID) ---
    # Eğer userId varsa onu kullan, yoksa guestId'yi kullan.
    # Bu sayede 'guest-12345' de model için geçerli bir kullanıcı olur.

    # 1. userId boş olan yerlere NaN koy (Garanti olsun)
    df['userId'] = df['userId'].replace('', np.nan)

    # 2. userId NaN ise guestId'yi al, o da yoksa satırı at
    df['final_user_id'] = df['userId'].fillna(df['guestId'])

    # 3. Hala ID'si olmayan çöp verileri temizle
    df = df.dropna(subset=['final_user_id'])

    # Event Tiplerini Puana Çevir
    event_weights = {
        "VIEW": 1,
        "ADD_TO_CART": 3,
        "PURCHASE": 5
    }

    df["score"] = df["eventType"].map(event_weights)

    # GÜNCELLEME: Gruplamayı 'final_user_id'ye göre yap
    df_grouped = df.groupby(["final_user_id", "productId"])["score"].sum().reset_index()

    # Sütun adını tekrar 'userId' yap ki recommender.py şaşırmasın
    df_grouped.rename(columns={"final_user_id": "userId"}, inplace=True)

    return df_grouped