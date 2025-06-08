from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from models.categoria import Categoria , CategoriaCreate

from auth.auth_bearer import JWTBearer
from db.fake_db import categorias , productos

router = APIRouter(prefix="/categorias", tags=["categorias"])

@router.get("", response_model=List[Categoria], dependencies=[Depends(JWTBearer())])
async def obtener_categorias():
    categorias_con_cantidad = []
    for c in categorias:
        count = sum(1 for p in productos if p.categoria_producto == c.nombre)
        categoria_dict = c.dict()
        categoria_dict["count_productos"] = count
        categorias_con_cantidad.append(Categoria(**categoria_dict))
    return categorias_con_cantidad


@router.post("", response_model=Categoria, status_code=status.HTTP_201_CREATED)
async def crear_categoria(categoria: CategoriaCreate):
    nueva_categoria = Categoria(id=len(categorias)+1, **categoria.dict())
    categorias.append(nueva_categoria)
    return nueva_categoria

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
