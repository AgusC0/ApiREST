from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from enum import Enum

class RolUser(str, Enum):
    Cliente = "Cliente"
    Administrador = "Administrador"

class UsuarioBase(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
    pais: str
    ciudad: str
    direccion: str
    telefono: str
    rol: RolUser
    is_active: bool
    imagen: Optional[str] = None

class UsuarioCreate(UsuarioBase):
    password: str

    @field_validator("password")
    def password_valido(cls, v):
        if len(v) < 8:
            raise ValueError("La password debe tener al menos 8 caracteres")
        if sum(c.isupper() for c in v) < 1:
            raise ValueError("La password debe tener al menos una letra mayúscula")
        return v

class UsuarioResponse(UsuarioBase):
    id: int

    class Config:
        from_attributes = True  
