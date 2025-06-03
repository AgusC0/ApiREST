from pydantic import BaseModel, Field

class Categoria(BaseModel):
    id: int = Field(..., gt=0)
    descripcion: str