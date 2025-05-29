from pydantic import BaseModel, EmailStr, SecretStr, Field, field_validator
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
    password: SecretStr = Field(...)
    pais: str
    ciudad: str
    direccion: str
    telefono: str
    rol: RolUser = Field(...)
    imagen: str | None = None

    @field_validator("password")
    def password_valido(cls, v):    
        password = v.get_secret_value() 
        if len(password) < 8:
            raise HTTPException(status_code=400, detail="La password tiene que tener 8 caracteres")
        if sum(c.isupper() for c in password) < 1:
            raise HTTPException(status_code=400, detail="La password tiene que tener al menos una letra mayúscula")
        return v
    @field_validator("rol")
    def rol_valido(cls,v):
        if v not in RolUser:
            raise HTTPException(status_code=400, detail="El rol tiene que ser Cliente o Administrador")
        return v