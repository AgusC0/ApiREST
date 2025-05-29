from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
from enum import Enum

class EstadoDespacho(str, Enum):
    despachado = "Despachado"
    noDespachado = "No Despachado"

class Venta(BaseModel):
    id: int = Field(..., gt=0)
    idUsuario: int = Field(..., gt=0)
    idProducto: int = Field(..., gt=0)
    cantidad: int = Field(..., gt=0)
    fecha: datetime
    despachado: EstadoDespacho

    @field_validator("despachado")
    def validar_estado(cls, v):
        if v not in EstadoDespacho:
            raise ValueError("El estado debe ser Despachado o No Despachado")
        return v