"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Search, Eye } from "lucide-react"

interface Sale {
  id: number
  user_id: number
  user_name?: string
  total_amount: number
  status: string
  created_at: string
  items?: SaleItem[]
}

interface SaleItem {
  id: number
  product_id: number
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

interface User {
  id: number
  username: string
  full_name: string
}

interface Product {
  id: number
  name: string
  price: number
}

export default function SalesManager() {
  const [sales, setSales] = useState<Sale[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [editingSale, setEditingSale] = useState<Sale | null>(null)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [formData, setFormData] = useState({
    user_id: "",
    status: "pending",
    items: [{ product_id: "", quantity: 1, unit_price: 0 }],
  })

  useEffect(() => {
    fetchSales()
    fetchUsers()
    fetchProducts()
  }, [])

  const fetchSales = async () => {
    try {
      const token = localStorage.getItem("admin_token")
      const response = await fetch("http://localhost:8000/ventas", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setSales(data)
      }
    } catch (error) {
      console.error("Error fetching sales:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("admin_token")
      const response = await fetch("http://localhost:8000/usuarios", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("admin_token")
      const response = await fetch("http://localhost:8000/productos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const fetchSaleDetails = async (saleId: number) => {
    try {
      const token = localStorage.getItem("admin_token")
      const response = await fetch(`http://localhost:8000/ventas/${saleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setSelectedSale(data)
        setIsDetailDialogOpen(true)
      }
    } catch (error) {
      console.error("Error fetching sale details:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem("admin_token")

    try {
      const url = editingSale ? `http://localhost:8000/ventas/${editingSale.id}` : "http://localhost:8000/ventas"

      const method = editingSale ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          user_id: Number.parseInt(formData.user_id),
          items: formData.items.map((item) => ({
            ...item,
            product_id: Number.parseInt(item.product_id),
            quantity: Number.parseInt(item.quantity.toString()),
            unit_price: Number.parseFloat(item.unit_price.toString()),
          })),
        }),
      })

      if (response.ok) {
        fetchSales()
        setIsDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error("Error saving sale:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta venta?")) {
      try {
        const token = localStorage.getItem("admin_token")
        const response = await fetch(`http://localhost:8000/ventas/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          fetchSales()
        }
      } catch (error) {
        console.error("Error deleting sale:", error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      user_id: "",
      status: "pending",
      items: [{ product_id: "", quantity: 1, unit_price: 0 }],
    })
    setEditingSale(null)
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_id: "", quantity: 1, unit_price: 0 }],
    })
  }

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.items]
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    }

    // Auto-update price when product changes
    if (field === "product_id") {
      const product = products.find((p) => p.id === Number.parseInt(value))
      if (product) {
        updatedItems[index].unit_price = product.price
      }
    }

    setFormData({
      ...formData,
      items: updatedItems,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const filteredSales = sales.filter(
    (sale) =>
      sale.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.id.toString().includes(searchTerm),
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
            Gestión de Ventas
          </h2>
          <p className="text-gray-400 mt-1">Administra las ventas y transacciones</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={resetForm}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 shadow-lg shadow-cyan-500/25"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Venta
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-cyan-400/50 max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-cyan-300">{editingSale ? "Editar Venta" : "Crear Nueva Venta"}</DialogTitle>
              <DialogDescription className="text-gray-400">
                {editingSale ? "Modifica los datos de la venta" : "Completa los datos para crear una nueva venta"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="user" className="text-cyan-300">
                    Cliente
                  </Label>
                  <Select
                    value={formData.user_id}
                    onValueChange={(value) => setFormData({ ...formData, user_id: value })}
                  >
                    <SelectTrigger className="bg-gray-800/50 border-cyan-400/50 text-white">
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-cyan-400/50">
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()} className="text-white">
                          {user.full_name} ({user.username})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-cyan-300">
                    Estado
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="bg-gray-800/50 border-cyan-400/50 text-white">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-cyan-400/50">
                      <SelectItem value="pending" className="text-white">
                        Pendiente
                      </SelectItem>
                      <SelectItem value="completed" className="text-white">
                        Completada
                      </SelectItem>
                      <SelectItem value="cancelled" className="text-white">
                        Cancelada
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-cyan-300">Productos</Label>
                  <Button type="button" onClick={addItem} size="sm" className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar
                  </Button>
                </div>

                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 bg-gray-800/30 rounded-lg">
                    <div className="col-span-5">
                      <Label className="text-cyan-300 text-xs">Producto</Label>
                      <Select value={item.product_id} onValueChange={(value) => updateItem(index, "product_id", value)}>
                        <SelectTrigger className="bg-gray-800/50 border-cyan-400/50 text-white">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-cyan-400/50">
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id.toString()} className="text-white">
                              {product.name} - ${product.price}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-cyan-300 text-xs">Cantidad</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", Number.parseInt(e.target.value))}
                        className="bg-gray-800/50 border-cyan-400/50 text-white"
                        min="1"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-cyan-300 text-xs">Precio</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, "unit_price", Number.parseFloat(e.target.value))}
                        className="bg-gray-800/50 border-cyan-400/50 text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-cyan-300 text-xs">Total</Label>
                      <div className="text-green-400 font-medium py-2">
                        ${(item.quantity * item.unit_price).toFixed(2)}
                      </div>
                    </div>
                    <div className="col-span-1">
                      {formData.items.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                <div className="text-right">
                  <div className="text-lg font-bold text-green-400">
                    Total: ${formData.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0).toFixed(2)}
                  </div>
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
                  {editingSale ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sale Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="bg-gray-900 border-cyan-400/50 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-cyan-300">Detalles de la Venta #{selectedSale?.id}</DialogTitle>
            <DialogDescription className="text-gray-400">Información completa de la venta</DialogDescription>
          </DialogHeader>

          {selectedSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-cyan-300">Cliente</Label>
                  <div className="text-white">{selectedSale.user_name}</div>
                </div>
                <div>
                  <Label className="text-cyan-300">Estado</Label>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(selectedSale.status)}`}>
                      {selectedSale.status}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-cyan-300">Fecha</Label>
                  <div className="text-white">{new Date(selectedSale.created_at).toLocaleDateString()}</div>
                </div>
                <div>
                  <Label className="text-cyan-300">Total</Label>
                  <div className="text-green-400 font-bold text-lg">${selectedSale.total_amount}</div>
                </div>
              </div>

              {selectedSale.items && selectedSale.items.length > 0 && (
                <div>
                  <Label className="text-cyan-300">Productos</Label>
                  <div className="mt-2 space-y-2">
                    {selectedSale.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-gray-800/30 rounded">
                        <div>
                          <div className="text-white font-medium">{item.product_name}</div>
                          <div className="text-gray-400 text-sm">
                            {item.quantity} x ${item.unit_price}
                          </div>
                        </div>
                        <div className="text-green-400 font-medium">${item.total_price}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card className="bg-gray-800/50 border-cyan-400/30">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-cyan-300">Lista de Ventas</CardTitle>
              <CardDescription className="text-gray-400">{filteredSales.length} venta(s) encontrada(s)</CardDescription>
            </div>

            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar ventas..."
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
                  <TableHead className="text-cyan-300">ID</TableHead>
                  <TableHead className="text-cyan-300">Cliente</TableHead>
                  <TableHead className="text-cyan-300">Total</TableHead>
                  <TableHead className="text-cyan-300">Estado</TableHead>
                  <TableHead className="text-cyan-300">Fecha</TableHead>
                  <TableHead className="text-cyan-300">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow key={sale.id} className="border-cyan-400/20 hover:bg-gray-700/30">
                    <TableCell className="text-white font-medium">#{sale.id}</TableCell>
                    <TableCell className="text-gray-300">{sale.user_name}</TableCell>
                    <TableCell className="text-green-400 font-medium">${sale.total_amount}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(sale.status)}`}>
                        {sale.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-300">{new Date(sale.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => fetchSaleDetails(sale.id)}
                          className="border-purple-400/50 text-purple-400 hover:bg-purple-400/10"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(sale.id)}
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
