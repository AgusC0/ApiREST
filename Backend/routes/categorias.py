from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db.database import get_db
from auth.auth_bearer import JWTBearer
from models.categoria import Categoria as CategoriaModel
from models.producto import Producto as ProductoModel
from schemas.categoria import CategoriaCreate, Categoria

router = APIRouter(prefix="/categorias", tags=["categorias"])

@router.get("", response_model=List[Categoria], dependencies=[Depends(JWTBearer())])
async def obtener_categorias(db: Session = Depends(get_db)):
    categorias_db = db.query(CategoriaModel).all()
    resultado = []
    for c in categorias_db:
        count = db.query(ProductoModel).filter(ProductoModel.categoria_producto == c.nombre).count()
        resultado.append(Categoria(**c.__dict__, count_productos=count))
    return resultado

@router.post("", response_model=Categoria, status_code=status.HTTP_201_CREATED)
async def crear_categoria(categoria: CategoriaCreate, db: Session = Depends(get_db)):
    existente = db.query(CategoriaModel).filter_by(nombre=categoria.nombre).first()
    if existente:
        raise HTTPException(status_code=400, detail="La categoría ya existe")

    nueva_categoria = CategoriaModel(**categoria.dict())
    db.add(nueva_categoria)
    db.commit()
    return Categoria(**nueva_categoria.__dict__, count_productos=0)

@router.put("/{nombre}", response_model=Categoria, dependencies=[Depends(JWTBearer())])
async def actualizar_categoria(nombre: str, datos: CategoriaCreate, db: Session = Depends(get_db)):
    categoria = db.query(CategoriaModel).filter_by(nombre=nombre).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    categoria.descripcion = datos.descripcion
    categoria.is_active = datos.is_active

    db.commit()
    count = db.query(ProductoModel).filter_by(categoria_producto=nombre).count()
    return Categoria(**categoria.__dict__, count_productos=count)

@router.delete("/{nombre}", response_model=List[Categoria], dependencies=[Depends(JWTBearer())])
async def eliminar_categoria(nombre: str, db: Session = Depends(get_db)):
    categoria = db.query(CategoriaModel).filter_by(nombre=nombre).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    productos_asociados = db.query(ProductoModel).filter(ProductoModel.categoria_producto == nombre).first()
    if productos_asociados:
        raise HTTPException(
            status_code=400,
            detail="No se puede eliminar la categoría porque hay productos asociados a ella"
        )

    db.delete(categoria)
    db.commit()
    return await obtener_categorias(db)

