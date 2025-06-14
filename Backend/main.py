from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.usuarios import router as UsuariosRouter
from routes.productos import router as ProductosRouter
from routes.categorias import router as CategoriasRouter
# from routes.ventas import router as VentasRouter
from routes import auth
# from routes.descargas import router as DescargasRouter



app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(UsuariosRouter)
app.include_router(ProductosRouter)
app.include_router(CategoriasRouter)
# app.include_router(VentasRouter)
# app.include_router(DescargasRouter)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
