from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.usuarios import router as UsuariosRouter
from routes.productos import router as ProductosRouter
from routes.categorias import router as CategoriasRouter
from routes.ventas import router as VentasRouter
from routes import auth
from routes.descargas import router as DescargasRouter

app = FastAPI()

# Configuración CORS para permitir frontend local
origins = [
    "http://localhost:3000",  # Cambia si tu frontend corre en otro host/puerto
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # o ["*"] para permitir todos, pero menos seguro
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(UsuariosRouter)
app.include_router(ProductosRouter)
app.include_router(CategoriasRouter)
app.include_router(VentasRouter)
app.include_router(DescargasRouter)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
