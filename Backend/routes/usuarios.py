from fastapi import APIRouter, HTTPException, Form, UploadFile, File, Depends, status
from typing import List, Optional
import shutil
from sqlalchemy.orm import Session

from models.usuario import Usuario, RolUser
from schemas.usuario import UsuarioCreate, UsuarioResponse
from auth.auth_bearer import JWTBearer
from db.database import get_db
from auth.password_utils import hash_password

router = APIRouter(prefix="/usuarios", tags=["usuarios"])

@router.get("", response_model=List[UsuarioResponse], dependencies=[Depends(JWTBearer())])
async def obtener_usuarios(db: Session = Depends(get_db)):
    usuarios_db = db.query(Usuario).all()
    return usuarios_db

@router.post("", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
async def crear_usuario(
    nombre: str = Form(...),
    apellido: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    pais: str = Form(...),
    ciudad: str = Form(...),
    direccion: str = Form(...),
    telefono: str = Form(...),
    rol: str = Form(...),
    is_active: bool = Form(...),
    imagen: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    url_imagen = None
    if imagen:
        ruta = f"static/usuarios/{imagen.filename}"
        with open(ruta, "wb") as buffer:
            shutil.copyfileobj(imagen.file, buffer)
        url_imagen = ruta

    try:
        rol_enum = RolUser(rol)
    except ValueError:
        raise HTTPException(status_code=400, detail="Rol inválido. Debe ser Cliente o Administrador.")

    # Validar con Pydantic
    try:
        UsuarioCreate(
            nombre=nombre,
            apellido=apellido,
            email=email,
            password=password,
            pais=pais,
            ciudad=ciudad,
            direccion=direccion,
            telefono=telefono,
            rol=rol_enum,
            is_active=is_active,
            imagen=url_imagen
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    existing_user = db.query(Usuario).filter(Usuario.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    usuario_db = Usuario(
        nombre=nombre,
        apellido=apellido,
        email=email,
        password=hash_password(password),
        pais=pais,
        ciudad=ciudad,
        direccion=direccion,
        telefono=telefono,
        rol=rol_enum,
        is_active=is_active,
        imagen=url_imagen
    )

    db.add(usuario_db)
    db.commit()
    db.refresh(usuario_db)

    return usuario_db

@router.put("/{id}", response_model=UsuarioResponse, dependencies=[Depends(JWTBearer())])
async def actualizar_usuario(
    id: int,
    nombre: str = Form(...),
    apellido: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    pais: str = Form(...),
    ciudad: str = Form(...),
    direccion: str = Form(...),
    telefono: str = Form(...),
    rol: str = Form(...),
    is_active: bool = Form(...),
    imagen: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    usuario_db = db.query(Usuario).filter(Usuario.id == id).first()
    if not usuario_db:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    url_imagen = usuario_db.imagen
    if imagen:
        ruta = f"static/usuarios/{imagen.filename}"
        with open(ruta, "wb") as buffer:
            shutil.copyfileobj(imagen.file, buffer)
        url_imagen = ruta

    try:
        rol_enum = RolUser(rol)
    except ValueError:
        raise HTTPException(status_code=400, detail="Rol inválido. Debe ser Cliente o Administrador.")

    try:
        UsuarioCreate(
            nombre=nombre,
            apellido=apellido,
            email=email,
            password=password,
            pais=pais,
            ciudad=ciudad,
            direccion=direccion,
            telefono=telefono,
            rol=rol_enum,
            is_active=is_active,
            imagen=url_imagen
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    usuario_db.nombre = nombre
    usuario_db.apellido = apellido
    usuario_db.email = email
    usuario_db.password = hash_password(password)
    usuario_db.pais = pais
    usuario_db.ciudad = ciudad
    usuario_db.direccion = direccion
    usuario_db.telefono = telefono
    usuario_db.rol = rol_enum
    usuario_db.is_active = is_active
    usuario_db.imagen = url_imagen

    db.commit()
    db.refresh(usuario_db)

    return usuario_db

@router.delete("/{id}", response_model=List[UsuarioResponse], dependencies=[Depends(JWTBearer())])
async def eliminar_usuario(id: int, db: Session = Depends(get_db)):
    usuario_db = db.query(Usuario).filter(Usuario.id == id).first()
    if not usuario_db:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    db.delete(usuario_db)
    db.commit()

    usuarios_restantes = db.query(Usuario).all()
    return usuarios_restantes
