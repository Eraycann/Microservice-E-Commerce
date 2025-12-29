from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from database import get_interaction_data
from recommender import engine
import uvicorn
from contextlib import asynccontextmanager

# 👇 YENİ EKLENDİ: OpenTelemetry Importları
from opentelemetry import trace
from opentelemetry.sdk.resources import Resource, SERVICE_NAME
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.zipkin.json import ZipkinExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.sdk.trace.export import ConsoleSpanExporter, SimpleSpanProcessor

# 👇 YENİ EKLENDİ: Zipkin Ayarı
# Docker kullanıyorsan 'localhost' yerine 'zipkin' yazman gerekebilir.
ZIPKIN_ENDPOINT = "http://localhost:9411/api/v2/spans"


def setup_opentelemetry(app: FastAPI):
    resource = Resource(attributes={
        SERVICE_NAME: "ai-engine"
    })

    provider = TracerProvider(resource=resource)
    trace.set_tracer_provider(provider)

    # 1. Zipkin Exporter (Sunucuya gönderir)
    zipkin_exporter = ZipkinExporter(endpoint=ZIPKIN_ENDPOINT)

    # BatchSpanProcessor yerine SimpleSpanProcessor kullan (Anlık gönderim için test amaçlı)
    provider.add_span_processor(BatchSpanProcessor(zipkin_exporter))

    # 2. Console Exporter (Terminalde görmek için - DEBUG AMAÇLI)
    # Eğer terminalde JSON çıktıları görüyorsan Python çalışıyor, sorun Zipkin ağındadır.
    provider.add_span_processor(SimpleSpanProcessor(ConsoleSpanExporter()))

    FastAPIInstrumentor.instrument_app(app)

# --- STARTUP MANTIĞI ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 API Başlıyor...")

    # Model yüklemeden önce model yoksa eğitim yap
    loaded = engine.load_model()

    if not loaded:
        print("⚠️ Model bulunamadı. İlk eğitim başlatılıyor...")
        try:
            df = get_interaction_data()
            if not df.empty:
                engine.train(df)
            else:
                print("⚠️ Veritabanı boş, eğitim atlandı.")
        except Exception as e:
            print(f"⚠️ Eğitim sırasında hata: {e}")

    yield
    print("🛑 API Kapanıyor...")

app = FastAPI(lifespan=lifespan)

# 👇 YENİ EKLENDİ: Tracing'i başlat
setup_opentelemetry(app)

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
    if not engine.is_trained:
        raise HTTPException(status_code=503, detail="Model henüz hazır değil.")

    try:
        # Recommender işlemleri otomatik olarak trace edilecek
        product_ids = engine.recommend(request.userId, n=10)
        return {"userId": request.userId, "recommendations": product_ids}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- ARKA PLAN GÖREVİ ---
def run_training_task():
    print("⏳ Arka plan eğitimi başladı...")
    df = get_interaction_data()
    if not df.empty:
        engine.train(df)
    else:
        print("⚠️ Veri yok, eğitim iptal.")

@app.post("/train")
def train_model(background_tasks: BackgroundTasks):
    background_tasks.add_task(run_training_task)
    return {"message": "Eğitim işlemi arka planda başlatıldı."}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)