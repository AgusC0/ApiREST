from pydantic import BaseModel, EmailStr, SecretStr, Field, field_validator
from typing import Optional
from fastapi import HTTPException 
from enum import Enum


class RolUser(str, Enum):
    Cliente = "Cliente"
    Administrador = "Administrador"

class Usuario(BaseModel):
    id: int
    nombre: str
    apellido: str
    email: EmailStr
    password: SecretStr
    pais: str
    ciudad: str
    direccion: str
    telefono: str
    rol: RolUser
    is_active: bool
    imagen: Optional[str] = None

    @field_validator("password")
    def password_valido(cls, v):    
        password = v.get_secret_value() 
        if len(password) < 8:
            raise HTTPException(status_code=400, detail="La password tiene que tener 8 caracteres")
        if sum(c.isupper() for c in password) < 1:
            raise HTTPException(status_code=400, detail="La password tiene que tener al menos una letra mayúscula")
        return v
