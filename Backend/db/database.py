from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from core.config import settings  # Importamos la instancia de Settings

# Usamos la URL que se construye desde el archivo .env
SQLALCHEMY_DATABASE_URL = settings.database_url

engine = create_engine(SQLALCHEMY_DATABASE_URL)

# SessionLocal es una clase para crear sesiones
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Función generadora para usar en dependencias de FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
