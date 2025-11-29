from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from database import get_interaction_data
from recommender import engine
import uvicorn
from contextlib import asynccontextmanager


# Uygulama başlarken (Startup) modeli eğit
# 'app' parametresi kullanılmadığı için '_' olarak adlandırıldı (Shadowing hatasını çözer)
@asynccontextmanager
async def lifespan(_: FastAPI):
    print("🚀 API Başlıyor... Veriler çekiliyor...")
    df = get_interaction_data()

    # Veri varsa eğit
    if not df.empty:
        engine.train(df)
    else:
        print("⚠️ Veri bulunamadı veya boş, model eğitimi atlandı.")

    yield
    print("🛑 API Kapanıyor...")


app = FastAPI(lifespan=lifespan)


# İstek Modeli
class RecommendationRequest(BaseModel):
    userId: str


# --- Endpointler ---

@app.get("/")
def health_check():
    return {
        "status": "AI Engine is running",
        "model_trained": engine.is_trained
    }


@app.post("/predict")
def predict(request: RecommendationRequest):
    try:
        # Modeli kullanarak öneri al
        product_ids = engine.recommend(request.userId, n=10)
        return {"userId": request.userId, "recommendations": product_ids}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Yeniden Eğit Endpoint'i (Admin tetikleyebilir)
@app.post("/train")
def train_model():
    try:
        df = get_interaction_data()
        engine.train(df)
        return {"message": "Model başarıyla yeniden eğitildi.", "data_count": len(df)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    # Host 0.0.0.0 olmalı ki Docker veya dış ağdan erişilebilsin
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)