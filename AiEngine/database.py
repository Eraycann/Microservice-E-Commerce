# MongoDB'den veriyi çekip Pandas DataFrame'e çevirir.
from pymongo import MongoClient
import pandas as pd

# MongoDB Bağlantısı (Java ile aynı yere bağlanıyor)
MONGO_URI = "mongodb://admin:admin@localhost:27017/"
DB_NAME = "ecommerce-recommendation-db"
COLLECTION_NAME = "user_interactions"


def get_interaction_data():
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]

    # Veriyi çek (Sadece gerekli alanlar)
    cursor = collection.find({}, {"userId": 1, "productId": 1, "eventType": 1, "_id": 0})
    df = pd.DataFrame(list(cursor))

    if df.empty:
        return pd.DataFrame(columns=["userId", "productId", "score"])

    # Event Tiplerini Puana Çevir (Feature Engineering)
    event_weights = {
        "VIEW": 1,
        "ADD_TO_CART": 3,
        "PURCHASE": 5
    }

    # eventType kolonunu sayısal score kolonuna dönüştür
    df["score"] = df["eventType"].map(event_weights)

    # Aynı kullanıcı aynı ürüne hem bakıp hem aldıysa puanları topla (GroupBy)
    df_grouped = df.groupby(["userId", "productId"])["score"].sum().reset_index()

    return df_grouped