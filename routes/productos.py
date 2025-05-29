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
    precio: float = Form(...),
    categoria_producto: str = Form(...),
    imagen: Optional[UploadFile] = File(None)
):
    if not any(c.descripcion == categoria_producto for c in categorias):
        raise HTTPException(status_code=400, detail="Categoría no válida")

    url_imagen = None
    if imagen:
        os.makedirs("static/imagenes/Productos", exist_ok=True)
        ruta = f"static/imagenes/Productos/{imagen.filename}"
        with open(ruta, "wb") as f:
            shutil.copyfileobj(imagen.file, f)
        url_imagen = f"/imagenes/Productos/{imagen.filename}"

    producto = Producto(id=len(productos) + 1, nombre=nombre, precio=precio, categoria=categoria_producto, imagen=url_imagen)
    productos.append(producto)
    return producto

@router.put("/{id}", response_model=Producto, dependencies=[Depends(JWTBearer())])
async def actualizar_producto(
    id: int,
    nombre: str = Form(...),
    precio: float = Form(...),
    categoria_producto: str = Form(...),
    imagen: Optional[UploadFile] = File(None)
):
    if not any(c.descripcion == categoria_producto for c in categorias):
        raise HTTPException(status_code=400, detail="Categoría no válida")

    url_imagen = None
    if imagen:
        os.makedirs("static/imagenes/Productos", exist_ok=True)
        ruta = f"static/imagenes/Productos/{imagen.filename}"
        with open(ruta, "wb") as f:
            shutil.copyfileobj(imagen.file, f)
        url_imagen = f"/imagenes/Productos/{imagen.filename}"

    for p in productos:
        if p.id == id:
            p.nombre = nombre
            p.precio = precio
            p.categoria = categoria_producto
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
