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
        email="colinaagustin92@gmail.com",
        password=SecretStr("Chiquito12"),
        pais="Argentina",
        ciudad="Córdoba",
        direccion="Calle Falsa 123",
        telefono="123456789",
        rol=RolUser.Administrador,
        is_active=True,
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
        is_active=True,
        imagen=None
    )
]

# Lista simulada de productos
productos = [
    Producto(
        id=1,
        nombre="Mouse",
        descripcion="Mouse inalámbrico",
        precio=50.0,
        stock=10,
        categoria_producto="Periféricos",
        is_active=True,
        imagen=None
    ),
    Producto(
        id=2,
        nombre="Teclado",    
        descripcion="Teclado inalámbrico",
        precio=100.0,
        stock=5,
        categoria_producto="Periféricos",
        is_active=True,
        imagen=None
    )
]

# Lista simulada de categorías
categorias = [
    Categoria(
        id=1,
        nombre="Periféricos",
        descripcion="Periféricos de computadora",
        is_active=True,
    ),
    Categoria(
        id=2,
        nombre="Monitores",
        descripcion="Monitores de computadora",
        is_active=True,
    )
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
