from pydantic import BaseModel, Field
from typing import Optional

class Producto(BaseModel):
    id: int = Field(..., gt=0)
    nombre: str
    precio: float
    categoria: str
    imagen: Optional[str] = None