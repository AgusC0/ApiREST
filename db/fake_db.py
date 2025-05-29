from models.usuario import Usuario, RolUser
from models.producto import Producto
from models.venta import Venta, EstadoDespacho
from models.categoria import Categoria
from pydantic import SecretStr
from datetime import datetime

# Lista simulada de usuarios
usuarios = [
    Usuario(
        id=1,
        nombre="Agustín",
        apellido="Colina",
        email="agustin@example.com",
        password=SecretStr("Password123"),
        pais="Argentina",
        ciudad="Córdoba",
        direccion="Calle Falsa 123",
        telefono="123456789",
        rol=RolUser.Administrador,
        imagen=None
    ),
    Usuario(
        id=2,
        nombre="Laura",
        apellido="Cattini",
        email="laura@example.com",
        password=SecretStr("LauraPass1"),
        pais="Argentina",
        ciudad="Rosario",
        direccion="Calle Verdadera 456",
        telefono="987654321",
        rol=RolUser.Cliente,
        imagen=None
    )
]

# Lista simulada de productos
productos = [
    Producto(id=1, nombre="Mouse Gamer", precio=5999.99, categoria="Periféricos", imagen=None),
    Producto(id=2, nombre="Teclado Mecánico", precio=9999.50, categoria="Periféricos", imagen=None)
]

# Lista simulada de categorías
categorias = [
    Categoria(id=1, descripcion="Periféricos"),
    Categoria(id=2, descripcion="Accesorios")
]

# Lista simulada de ventas
ventas = [
    Venta(
        id=1,
        idUsuario=2,
        idProducto=1,
        cantidad=1,
        fecha=datetime.now(),
        despachado=EstadoDespacho.noDespachado
    )
]
