from sqlalchemy import Column, String, Boolean
from db.database import Base

class Categoria(Base):
    __tablename__ = "categorias"
    nombre = Column(String(100), primary_key=True)
    descripcion = Column(String(255))
    is_active = Column(Boolean)
