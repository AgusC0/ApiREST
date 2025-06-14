from fastapi import APIRouter, Form, File, UploadFile, HTTPException, status, Depends
from typing import Optional, List
import shutil
from sqlalchemy.orm import Session

from models.producto import Producto as ProductoModel
from models.categoria import Categoria as CategoriaModel
from auth.auth_bearer import JWTBearer
from db.database import get_db
from schemas.producto import Producto  

router = APIRouter(prefix="/productos", tags=["productos"])

@router.get("", response_model=List[Producto], dependencies=[Depends(JWTBearer())])
async def obtener_productos(db: Session = Depends(get_db)):
    return db.query(ProductoModel).all()


@router.post("", response_model=Producto, status_code=status.HTTP_201_CREATED, dependencies=[Depends(JWTBearer())])
async def crear_producto(
    nombre: str = Form(...),
    descripcion: str = Form(...),
    precio: float = Form(...),
    stock: int = Form(...),
    categoria_producto: str = Form(...),
    is_active: bool = Form(...),
    imagen: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    
    categoria = db.query(CategoriaModel).filter(CategoriaModel.nombre == categoria_producto).first()
    if not categoria:
        nueva_categoria = CategoriaModel(
            nombre=categoria_producto,
            descripcion="Categoría generada automáticamente",
            is_active=True
        )
        db.add(nueva_categoria)
        db.commit()

    url_imagen = None
    if imagen:
        ruta = f"static/productos/{imagen.filename}"
        with open(ruta, "wb") as buffer:
            shutil.copyfileobj(imagen.file, buffer)
        url_imagen = ruta

    nuevo_producto = ProductoModel(
        nombre=nombre,
        descripcion=descripcion,
        precio=precio,
        stock=stock,
        categoria_producto=categoria_producto,
        is_active=is_active,
        imagen=url_imagen
    )
    db.add(nuevo_producto)
    db.commit()
    db.refresh(nuevo_producto)
    return nuevo_producto


@router.put("/{id}", response_model=Producto, dependencies=[Depends(JWTBearer())])
async def actualizar_producto(
    id: int,
    nombre: str = Form(...),
    descripcion: str = Form(...),
    precio: float = Form(...),
    stock: int = Form(...),
    categoria_producto: str = Form(...),
    is_active: bool = Form(...),
    imagen: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    producto = db.query(ProductoModel).filter(ProductoModel.id == id).first()

    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    # Validar que la categoría existe
    categoria = db.query(CategoriaModel).filter(CategoriaModel.nombre == categoria_producto).first()
    if not categoria:
        raise HTTPException(status_code=400, detail=f"La categoría '{categoria_producto}' no existe")

    url_imagen = producto.imagen
    if imagen:
        ruta = f"static/productos/{imagen.filename}"
        with open(ruta, "wb") as buffer:
            shutil.copyfileobj(imagen.file, buffer)
        url_imagen = ruta

    producto.nombre = nombre
    producto.descripcion = descripcion
    producto.precio = precio
    producto.stock = stock
    producto.categoria_producto = categoria_producto
    producto.is_active = is_active
    producto.imagen = url_imagen

    db.commit()
    db.refresh(producto)
    return producto


@router.delete("/{id}", response_model=List[Producto], dependencies=[Depends(JWTBearer())])
async def eliminar_producto(id: int, db: Session = Depends(get_db)):
    producto = db.query(ProductoModel).filter(ProductoModel.id == id).first()

    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    db.delete(producto)
    db.commit()

    return db.query(ProductoModel).all()
