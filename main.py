from fastapi import FastAPI
from routes.usuarios import router as UsuariosRouter
from routes.productos import router as ProductosRouter
from routes.categorias import router as CategoriasRouter
from routes.ventas import router as VentasRouter
from routes.auth import router as LoginRouter
from routes.descargas import router as DescargasRouter

app = FastAPI()

app.include_router(LoginRouter)
app.include_router(UsuariosRouter)
app.include_router(ProductosRouter)
app.include_router(CategoriasRouter)
app.include_router(VentasRouter)
app.include_router(DescargasRouter)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)