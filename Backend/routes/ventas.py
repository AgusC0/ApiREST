from fastapi import APIRouter, HTTPException, Depends, status
from typing import List

from models.venta import Venta, EstadoDespacho
from auth.auth_bearer import JWTBearer
from db.fake_db import ventas, usuarios, productos

router = APIRouter(prefix="/ventas", tags=["ventas"])

@router.get("", response_model=List[Venta], dependencies=[Depends(JWTBearer())])
async def obtener_ventas():
    return ventas

@router.get("/{id}/despachado/{estado}", response_model=List[Venta], dependencies=[Depends(JWTBearer())])
async def obtener_ventas_filtradas(id: int, estado: EstadoDespacho):
    return [v for v in ventas if v.id == id and v.despachado == estado]

@router.post("", response_model=Venta, status_code=status.HTTP_201_CREATED, dependencies=[Depends(JWTBearer())])
async def crear_venta(venta: Venta):
    if not any(u.id == venta.idUsuario for u in usuarios):
        raise HTTPException(status_code=400, detail="Usuario no encontrado")
    if not any(p.id == venta.idProducto for p in productos):
        raise HTTPException(status_code=400, detail="Producto no encontrado")
    ventas.append(venta)
    return venta

@router.put("/{id}", response_model=Venta, dependencies=[Depends(JWTBearer())])
async def actualizar_estado_despacho(id: int, estado: EstadoDespacho):
    for v in ventas:
        if v.id == id:
            v.despachado = estado
            return v
    raise HTTPException(status_code=404, detail="Venta no encontrada")
