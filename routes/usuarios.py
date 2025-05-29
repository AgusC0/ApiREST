from fastapi import APIRouter, HTTPException, Form, UploadFile, File, Depends, status
from typing import List, Optional
import os, shutil

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
    rol: RolUser = Form(...),
    imagen: Optional[UploadFile] = File(None)
):
    url_imagen = None
    if imagen:
        os.makedirs("static/imagenes/Persona", exist_ok=True)
        ruta = f"static/imagenes/Persona/{imagen.filename}"
        with open(ruta, "wb") as f:
            shutil.copyfileobj(imagen.file, f)
        url_imagen = f"/imagenes/Persona/{imagen.filename}"

    usuario = Usuario(
        id=len(usuarios) + 1,
        nombre=nombre,
        apellido=apellido,
        email=email,
        password=password,
        pais=pais,
        ciudad=ciudad,
        direccion=direccion,
        telefono=telefono,
        rol=rol,
        imagen=url_imagen
    )
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
    rol: RolUser = Form(...),
    imagen: Optional[UploadFile] = File(None)
):
    url_imagen = None
    if imagen:
        os.makedirs("static/imagenes/Persona", exist_ok=True)
        ruta = f"static/imagenes/Persona/{imagen.filename}"
        with open(ruta, "wb") as f:
            shutil.copyfileobj(imagen.file, f)
        url_imagen = f"/imagenes/Persona/{imagen.filename}"

    for u in usuarios:
        if u.id == id:
            u.nombre = nombre
            u.apellido = apellido
            u.email = email
            u.password = password
            u.pais = pais
            u.ciudad = ciudad
            u.direccion = direccion
            u.telefono = telefono
            u.rol = rol
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
