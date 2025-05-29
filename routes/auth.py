from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from models.login import Login
from db.fake_db import usuarios
from auth.auth_handler import crear_token

router = APIRouter(prefix="/login", tags=["Login"])

@router.post("")
async def login(user: Login):
    for u in usuarios:
        if u.email == user.email and u.password == user.password:
            if u.rol != "Administrador":
                raise HTTPException(status_code=403, detail="Solo administradores pueden loguearse")
            token = crear_token({"email": u.email, "rol": u.rol})
            return JSONResponse(status_code=200, content={"token": token})
    raise HTTPException(status_code=401, detail="Credenciales inválidas")
