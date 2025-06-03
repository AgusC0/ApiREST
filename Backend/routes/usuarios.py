from fastapi import APIRouter, HTTPException, Form, UploadFile, File, Depends, status
from pydantic import SecretStr
from typing import List, Optional
import shutil

from models.usuario import Usuario, RolUser
from auth.auth_bearer import JWTBearer
from db.fake_db import usuarios

router = APIRouter(prefix="/usuarios", tags=["usuarios"])

@router.get("", response_model=List[Usuario], dependencies=[Depends(JWTBearer())])
async def obtener_usuarios():
    return usuarios

@router.post("", response_model=Usuario, status_code=status.HTTP_201_CREATED)
async def crear_usuario(
    nombre: str = Form(...),
    apellido: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    pais: str = Form(...),
    ciudad: str = Form(...),
    direccion: str = Form(...),
    telefono: str = Form(...),
    rol: str = Form(...),  # se recibe como string
    is_active: bool = Form(...),
    imagen: Optional[UploadFile] = File(None)
):
    url_imagen = None
    if imagen:
        ruta = f"static/usuarios/{imagen.filename}"
        with open(ruta, "wb") as buffer:
            shutil.copyfileobj(imagen.file, buffer)
        url_imagen = ruta

    try:
        usuario = Usuario(
            id=len(usuarios) + 1,
            nombre=nombre,
            apellido=apellido,
            email=email,
            password=SecretStr(password),
            pais=pais,
            ciudad=ciudad,
            direccion=direccion,
            telefono=telefono,
            rol=RolUser(rol),  # casteamos el string a Enum
            is_active=is_active,
            imagen=url_imagen
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Rol inválido. Debe ser Cliente o Administrador.")

    usuarios.append(usuario)
    return usuario

@router.put("/{id}", response_model=Usuario, dependencies=[Depends(JWTBearer())])
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
    imagen: Optional[UploadFile] = File(None)
):
    url_imagen = None
    if imagen:
        ruta = f"static/usuarios/{imagen.filename}"
        with open(ruta, "wb") as buffer:
            shutil.copyfileobj(imagen.file, buffer)
        url_imagen = ruta

    for u in usuarios:
        if u.id == id:
            u.nombre = nombre
            u.apellido = apellido
            u.email = email
            u.password = SecretStr(password)
            u.pais = pais
            u.ciudad = ciudad
            u.direccion = direccion
            u.telefono = telefono
            u.rol = RolUser(rol)
            u.is_active = is_active
            if url_imagen:
                u.imagen = url_imagen
            return u

    raise HTTPException(status_code=404, detail="Usuario no encontrado")

@router.delete("/{id}", response_model=List[Usuario], dependencies=[Depends(JWTBearer())])
async def eliminar_usuario(id: int):
    for u in usuarios:
        if u.id == id:
            usuarios.remove(u)
            return usuarios
    raise HTTPException(status_code=404, detail="Usuario no encontrado")
