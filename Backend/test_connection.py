from sqlalchemy import text
from db.database import engine

def test_connection():
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("✅ Conexión a la base de datos exitosa.")
    except Exception as e:
        print("❌ Error al conectar con la base de datos:")
        print(e)

if __name__ == "__main__":
    test_connection()
