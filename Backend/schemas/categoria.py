from pydantic import BaseModel

class CategoriaBase(BaseModel):
    nombre: str
    descripcion: str
    is_active: bool

class CategoriaCreate(CategoriaBase):
    pass

class Categoria(CategoriaBase):
    count_productos: int         

    class Config:
        orm_mode = True

