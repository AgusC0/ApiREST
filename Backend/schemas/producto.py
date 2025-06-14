from pydantic import BaseModel, Field
from typing import Optional

class Producto(BaseModel):
    id: int = Field(..., gt=0)
    nombre: str
    descripcion: str
    precio: float
    stock: int
    categoria_producto: str
    is_active: bool
    imagen: Optional[str] = None

    class Config:
        orm_mode = True
