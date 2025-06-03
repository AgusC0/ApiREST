from pydantic import BaseModel, EmailStr, Field, field_validator

class Login(BaseModel):
    email: EmailStr
    password: str = Field(...)

    @field_validator("password")
    def password_valido(cls, v):    
        if len(v) < 8:
            raise ValueError("La password tiene que tener 8 caracteres")
        if sum(c.isupper() for c in v) < 1:
            raise ValueError("La password tiene que tener al menos una letra mayúscula")
        return v
