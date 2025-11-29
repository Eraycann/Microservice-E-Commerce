from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from database import get_interaction_data
from recommender import engine
import uvicorn
from contextlib import asynccontextmanager


# --- YENİ STARTUP MANTIĞI ---
@asynccontextmanager
async def lifespan(_: FastAPI):
    print("🚀 API Başlıyor...")

    # 1. Önce kayıtlı modeli yüklemeyi dene
    loaded = engine.load_model()

    # 2. Eğer kayıtlı model yoksa (İlk kurulum), mecburen eğitim yap
    if not loaded:
        print("⚠️ Model bulunamadı. İlk eğitim başlatılıyor...")
        df = get_interaction_data()
        if not df.empty:
            engine.train(df)
        else:
            print("⚠️ Veritabanı boş, eğitim atlandı.")

    yield
    print("🛑 API Kapanıyor...")


app = FastAPI(lifespan=lifespan)


class RecommendationRequest(BaseModel):
    userId: str


@app.get("/")
def health_check():
    return {
        "status": "AI Engine is running",
        "model_trained": engine.is_trained
    }


@app.post("/predict")
def predict(request: RecommendationRequest):
    # Model eğitilmemişse 503 dön (Java Fallback yapsın)
    if not engine.is_trained:
        raise HTTPException(status_code=503, detail="Model henüz hazır değil.")

    try:
        product_ids = engine.recommend(request.userId, n=10)
        return {"userId": request.userId, "recommendations": product_ids}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- ARKA PLAN GÖREVİ (Non-Blocking) ---
def run_training_task():
    print("⏳ Arka plan eğitimi başladı...")
    df = get_interaction_data()
    if not df.empty:
        engine.train(df)
    else:
        print("⚠️ Veri yok, eğitim iptal.")


@app.post("/train")
def train_model(background_tasks: BackgroundTasks):
    # İsteği hemen cevapla, eğitimi arka plana at
    background_tasks.add_task(run_training_task)
    return {"message": "Eğitim işlemi arka planda başlatıldı."}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)