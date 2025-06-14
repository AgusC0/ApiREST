from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from db.database import Base

class Producto(Base):
    __tablename__ = "productos"
    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(100))
    descripcion = Column(String(255))
    precio = Column(Float)
    stock = Column(Integer)
    categoria_producto = Column(String(100), ForeignKey("categorias.nombre"))
    is_active = Column(Boolean)
    imagen = Column(String(255), nullable=True)

