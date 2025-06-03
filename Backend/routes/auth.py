from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from models.login import Login
from db.fake_db import usuarios
from auth.auth_handler import crear_token, validar_token
from models.usuario import RolUser  # Importa el enum rol

router = APIRouter(prefix="/auth", tags=["Auth"])

security = HTTPBearer()

@router.post("")
async def login(user: Login):
    for u in usuarios:
        if u.email == user.email and u.password.get_secret_value() == user.password:
            if u.rol != RolUser.Administrador:
                raise HTTPException(status_code=403, detail="Solo administradores pueden loguearse")
            token = crear_token({"email": u.email, "rol": u.rol})
            return JSONResponse(status_code=200, content={"token": token})
    raise HTTPException(status_code=401, detail="Credenciales inválidas")



@router.get("/verify-token")
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = validar_token(token)
    return {"status": "ok", "payload": payload}
