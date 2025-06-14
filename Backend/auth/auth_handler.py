from jwt import encode, decode, ExpiredSignatureError, InvalidTokenError
from fastapi import HTTPException
from core.config import settings
from datetime import datetime, timedelta

def crear_token(data: dict) -> str:
    data_copy = data.copy()
    data_copy["exp"] = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    return encode(data_copy, settings.secret_key, algorithm=settings.algorithm)

def validar_token(token: str) -> dict:
    try:
        return decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido o mal formado")