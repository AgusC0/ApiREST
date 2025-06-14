from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from schemas.login import Login
from models.usuario import Usuario, RolUser
from auth.auth_handler import crear_token, validar_token
from db.database import get_db
from passlib.context import CryptContext



router = APIRouter(prefix="/auth", tags=["Auth"])

security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verificar_contraseña(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

@router.post("/login")
def login(user: Login, db: Session = Depends(get_db)):
    db_user = db.query(Usuario).filter(Usuario.email == user.email).first()

    if not db_user:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    if not verificar_contraseña(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    if db_user.rol != RolUser.Administrador:
        raise HTTPException(status_code=403, detail="Solo administradores pueden loguearse")

    token = crear_token({"email": db_user.email, "rol": db_user.rol})
    return JSONResponse(status_code=200, content={"token": token})


@router.get("/verify-token")
def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = validar_token(token)
    return {"status": "ok", "payload": payload}

