from sqlalchemy import Column, Integer, String, Boolean, Enum
from db.database import Base
import enum

class RolUser(str, enum.Enum):
    Cliente = "Cliente"
    Administrador = "Administrador"

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100))
    apellido = Column(String(100))
    email = Column(String(150), unique=True, index=True)
    password = Column(String(255))
    pais = Column(String(100))
    ciudad = Column(String(100))
    direccion = Column(String(255))
    telefono = Column(String(50))
    rol = Column(Enum(RolUser))
    is_active = Column(Boolean)
    imagen = Column(String(255), nullable=True)
