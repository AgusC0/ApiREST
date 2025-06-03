from fastapi import APIRouter, Form, File, UploadFile, HTTPException, status, Depends
from typing import Optional, List
import os, shutil

from models.producto import Producto
from auth.auth_bearer import JWTBearer
from db.fake_db import productos, categorias

router = APIRouter(prefix="/productos", tags=["productos"])

@router.get("", response_model=List[Producto], dependencies=[Depends(JWTBearer())])
async def obtener_productos():
    return productos

@router.post("", response_model=Producto, status_code=status.HTTP_201_CREATED, dependencies=[Depends(JWTBearer())])
async def crear_producto(
    nombre: str = Form(...),
    descripcion: str = Form(...),
    precio: float = Form(...),
    stock: int = Form(...),
    categoria_producto: str = Form(...),
    is_active: bool = Form(...),
    imagen: Optional[UploadFile] = File(None)
):

    url_imagen = None
    if imagen:
        ruta = f"static/productos/{imagen.filename}"
        with open(ruta, "wb") as buffer:
            shutil.copyfileobj(imagen.file, buffer)
        url_imagen = ruta

    producto = Producto(
        id=len(productos) + 1,
        nombre=nombre,
        descripcion=descripcion,
        precio=precio,
        stock=stock,
        categoria_producto=categoria_producto,
        is_active=is_active,
        imagen=url_imagen
    )
    productos.append(producto)
    return producto

@router.put("/{id}", response_model=Producto, dependencies=[Depends(JWTBearer())])
async def actualizar_producto(
    id: int,
    nombre: str = Form(...),
    descripcion: str = Form(...),
    precio: float = Form(...),
    stock: int = Form(...),
    categoria_producto: str = Form(...),
    is_active: bool = Form(...),
    imagen: Optional[UploadFile] = File(None)
):

    url_imagen = None
    if imagen:
        ruta = f"static/productos/{imagen.filename}"
        with open(ruta, "wb") as buffer:
            shutil.copyfileobj(imagen.file, buffer)
        url_imagen = ruta

    for p in productos:
        if p.id == id:
            p.nombre = nombre
            p.descripcion = descripcion
            p.precio = precio
            p.stock = stock
            p.categoria_producto = categoria_producto
            p.is_active = is_active
            if url_imagen:
                p.imagen = url_imagen
            return p

    raise HTTPException(status_code=404, detail="Producto no encontrado")

@router.delete("/{id}", response_model=List[Producto], dependencies=[Depends(JWTBearer())])
async def eliminar_producto(id: int):
    for p in productos:
        if p.id == id:
            productos.remove(p)
            return productos
    raise HTTPException(status_code=404, detail="Producto no encontrado")
