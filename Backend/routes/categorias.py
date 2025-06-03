from fastapi import APIRouter, HTTPException, Depends, status
from typing import List

from models.categoria import Categoria
from auth.auth_bearer import JWTBearer
from db.fake_db import categorias

router = APIRouter(prefix="/categorias", tags=["categorias"])

@router.get("", response_model=List[Categoria], dependencies=[Depends(JWTBearer())])
async def obtener_categorias():
    return categorias

@router.post("", response_model=Categoria, status_code=status.HTTP_201_CREATED, dependencies=[Depends(JWTBearer())])
async def crear_categoria(categoria: Categoria):
    categorias.append(categoria)
    return categoria

@router.put("/{id}", response_model=Categoria, dependencies=[Depends(JWTBearer())])
async def actualizar_categoria(id: int, nueva_categoria: Categoria):
    for c in categorias:
        if c.id == id:
            c.descripcion = nueva_categoria.descripcion
            return c
    raise HTTPException(status_code=404, detail="Categoría no encontrada")

@router.delete("/{id}", response_model=List[Categoria], dependencies=[Depends(JWTBearer())])
async def eliminar_categoria(id: int):
    for c in categorias:
        if c.id == id:
            categorias.remove(c)
            return categorias
    raise HTTPException(status_code=404, detail="Categoría no encontrada")
