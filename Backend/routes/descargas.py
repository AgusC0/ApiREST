from fastapi import APIRouter, HTTPException, Query, Depends
from fastapi.responses import FileResponse
import os

from auth.auth_bearer import JWTBearer
from enum import Enum

class TipoArchivo(str, Enum):
    Persona = "Persona"
    Productos = "Productos"

router = APIRouter(prefix="/descargas", tags=["descargas"])

@router.get("", dependencies=[Depends(JWTBearer())])
async def descargar_archivo(
    tipo: TipoArchivo = Query(...),
    nombre_archivo: str = Query(...)
):
    carpeta = tipo.value
    ruta = os.path.join("static", "imagenes", carpeta, nombre_archivo)

    if not os.path.exists(ruta):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

    return FileResponse(path=ruta, media_type="application/octet-stream", filename=nombre_archivo)
