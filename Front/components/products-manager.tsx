"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Edit, Trash2, Search, UploadCloud } from "lucide-react"

interface Product {
  id: number
  nombre: string
  descripcion: string
  precio: number
  stock: number
  categoria_producto: string
  is_active: boolean
  imagen: string
}

interface Category {
  id: number
  nombre: string
  descripcion: string
  is_active: boolean
  count_productos: number
}

export default function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isCustom, setIsCustom] = useState(false);
  const [categorySearch, setCategorySearch] = useState("")
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: 0,
    stock: 0,
    categoria_producto: "",
    is_active: true,
    imagen: null as File | null,
  })

  const getToken = (): string | null => {
    const token = localStorage.getItem("admin_token")
    if (!token) {
      console.error("Token de autenticación no encontrado. Redirigiendo o mostrando error.")
      return null
    }
    return token
  }

  const fetchProducts = async () => {
    const token = getToken()
    if (!token) return
    try {
      const response = await fetch("http://localhost:8000/productos", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      } else {
        console.error("Error en la respuesta al obtener productos")
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    const token = getToken()
    if (!token) return
    try {
      const response = await fetch("http://localhost:8000/categorias", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else {
        console.error("Error en la respuesta al obtener categorías")
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  useEffect(() => {
    setIsLoading(true)
    fetchProducts()
    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = getToken()
    if (!token) return

    const form = new FormData()
    form.append("nombre", formData.nombre)
    form.append("descripcion", formData.descripcion)
    form.append("precio", formData.precio.toString())
    form.append("stock", formData.stock.toString())
    form.append("categoria_producto", formData.categoria_producto)
    form.append("is_active", formData.is_active.toString())
    if (formData.imagen) {
      form.append("imagen", formData.imagen)
    }

    try {
      const url = editingProduct
        ? `http://localhost:8000/productos/${editingProduct.id}`
        : "http://localhost:8000/productos"
      const method = editingProduct ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      })

      if (response.ok) {
        fetchProducts()
        if (isCustom && formData.categoria_producto.trim() !== "") {
            await saveNewCategory(formData.categoria_producto.trim())
        }
        setIsDialogOpen(false)
        resetForm()
      } else {
        console.error("Error en la respuesta al guardar el producto")
      }
    } catch (error) {
      console.error("Error saving product:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      const token = getToken()
      if (!token) return
      try {
        const response = await fetch(`http://localhost:8000/productos/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.ok) {
          fetchProducts()
        } else {
          console.error("Error en la respuesta al eliminar el producto")
        }
      } catch (error) {
        console.error("Error deleting product:", error)
      }
    }
  }

const saveNewCategory = async (nombre: string) => {
  const token = getToken()
  if (!token) return
  try {
    const response = await fetch("http://localhost:8000/categorias", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nombre: nombre,
        descripcion: "Agregada automáticamente desde frontend",
        is_active: true,
      }),
    })
    if (response.ok) {
      fetchCategories()
    } else {
      console.error("No se pudo guardar la nueva categoría.")
    }
  } catch (error) {
    console.error("Error guardando categoría:", error)
  }
}
  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      precio: 0,
      stock: 0,
      categoria_producto: "",
      is_active: true,
      imagen: null,
    })
    setEditingProduct(null)
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio,
      stock: product.stock,
      categoria_producto: product.categoria_producto.toString(),
      is_active: product.is_active,
      imagen: null,
    })
    setIsDialogOpen(true)
  }

  const filteredProducts = products.filter(
    (product) =>
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Gestión de Productos
          </h2>
          <p className="text-gray-400 mt-1">Administra el catálogo de productos</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={resetForm}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 shadow-lg shadow-cyan-500/25"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-cyan-400/50 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-cyan-300">
                {editingProduct ? "Editar Producto" : "Crear Nuevo Producto"}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {editingProduct ? "Modifica los datos del producto" : "Completa los datos para crear un nuevo producto"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-cyan-300">
                    Nombre
                  </Label>
                  <Input
                    id="name"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                    className="bg-gray-800/50 border-cyan-400/50 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-cyan-300">
                    Categoría
                  </Label>
                  <Select
                    value={isCustom ? "other" : formData.categoria_producto}
                    onValueChange={(value) => {
                      if (value === "other") {
                        setIsCustom(true);
                        setFormData({ ...formData, categoria_producto: "" });
                      } else {
                        setIsCustom(false);
                        setFormData({ ...formData, categoria_producto: value });
                      }
                    }}
                  >
                    <SelectTrigger className="bg-gray-800/50 border-cyan-400/50 text-white">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-cyan-400/50">
                      {categories.length > 5 && (
                        <div className="p-2">
                          <Input
                            placeholder="Buscar categoría..."
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(e.target.value)}
                            className="bg-gray-700 text-white border-cyan-400/50"
                          />
                        </div>
                      )}
                      {categories
                        .filter((cat) =>
                          cat.nombre.toLowerCase().includes(categorySearch.toLowerCase())
                        )
                        .map((category) => (
                          <SelectItem
                            key={category.nombre}
                            value={category.nombre}
                            className="text-white"
                          >
                            {category.nombre} ({category.count_productos})
                          </SelectItem>
                        ))}
                      <SelectItem value="other" className="text-white italic">
                        Otra...
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {isCustom && (
                    <Input
                      placeholder="Escribí una nueva categoría"
                      value={formData.categoria_producto}
                      onChange={(e) =>
                        setFormData({ ...formData, categoria_producto: e.target.value })
                      }
                      className="bg-gray-800 text-white border-cyan-400/50 mt-2"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-cyan-300">
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  required
                  className="bg-gray-800/50 border-cyan-400/50 text-white"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-cyan-300">
                    Precio
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: Number.parseFloat(e.target.value) })}
                    required
                    className="bg-gray-800/50 border-cyan-400/50 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-cyan-300">
                    Stock
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number.parseInt(e.target.value) })}
                    required
                    className="bg-gray-800/50 border-cyan-400/50 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imagen" className="text-cyan-300">
                    Imagen
                  </Label>
                  <Input
                    id="imagen"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, imagen: (e.target as HTMLInputElement).files?.[0] || null,}) 
                    }
                    required={!editingProduct}
                    className="bg-gray-800/50 border-cyan-400/50 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-gray-600 text-gray-300"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                >
                  {editingProduct ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-gray-800/50 border-cyan-400/30">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-cyan-300">Lista de Productos</CardTitle>
              <CardDescription className="text-gray-400">
                {filteredProducts.length} producto(s) encontrado(s)
              </CardDescription>
            </div>

            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700/50 border-cyan-400/50 text-white w-full sm:w-64"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-cyan-400/30">
                  <TableHead className="text-cyan-300">Producto</TableHead>
                  <TableHead className="text-cyan-300">Categoría</TableHead>
                  <TableHead className="text-cyan-300">Precio</TableHead>
                  <TableHead className="text-cyan-300">Stock</TableHead>
                  <TableHead className="text-cyan-300">Estado</TableHead>
                  <TableHead className="text-cyan-300">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(Array.isArray(filteredProducts) ? filteredProducts : [])
                  .filter((product) => product !== undefined && product !== null)
                  .map((product) => (
                    <TableRow
                      key={product.id ?? Math.random()}
                      className="border-cyan-400/20 hover:bg-gray-700/30"
                    >
                      <TableCell>
                        <div>
                          <div className="text-white font-medium">{product.nombre ?? "Sin nombre"}</div>
                          <div className="text-gray-400 text-sm truncate max-w-xs">{product.descripcion ?? "-"}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">{product.categoria_producto ?? "-"}</TableCell>
                      <TableCell className="text-green-400 font-medium">${product.precio ?? 0}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            product.stock > 10
                              ? "bg-green-500/20 text-green-400"
                              : product.stock > 0
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {product.stock ?? 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            product.is_active
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {product.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(product)}
                            className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(product.id)}
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
