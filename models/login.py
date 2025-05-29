from pydantic import BaseModel, EmailStr, SecretStr, Field, field_validator
from fastapi import HTTPException


class Login(BaseModel):
    email: EmailStr
    password: SecretStr = Field(...)

    @field_validator("password")
    def password_valido(cls, v):    
        password = v.get_secret_value() 
        if len(password) < 8:
            raise HTTPException(status_code=400, detail="La password tiene que tener 8 caracteres")
        if sum(c.isupper() for c in password) < 1:
            raise HTTPException(status_code=400, detail="La password tiene que tener al menos una letra mayúscula")
        return v