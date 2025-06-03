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
import { Plus, Edit, Trash2, Search } from "lucide-react"
import { set } from "date-fns"

interface User {
  id: number
  nombre: string
  apellido: string
  email: string
  password: string
  pais: string
  ciudad: string
  direccion: string
  telefono: string
  rol: string
  imagen: string
  is_active: boolean
}

export default function UsersManager() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    pais: "",
    ciudad: "",
    direccion: "",
    telefono: "",
    rol: "",
    imagen: null as File | null,
    is_active: true

  })

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("admin_token")
      const response = await fetch("http://localhost:8000/usuarios", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          setUsers(data)
        } else {
          console.error("Respuesta no es array:", data)
        }
      } else {
        console.error("Error response:", response.status)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setIsLoading(true)
    fetchUsers()
  }, [])



const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  const token = localStorage.getItem("admin_token")

  try {
    const url = editingUser
      ? `http://localhost:8000/usuarios/${editingUser.id}`
      : "http://localhost:8000/usuarios"
    const method = editingUser ? "PUT" : "POST"

    const data = new FormData()
    data.append("nombre", formData.nombre)
    data.append("apellido", formData.apellido)
    data.append("email", formData.email)
    if (!editingUser || formData.password.trim()) {
      data.append("password", formData.password)
    }
    data.append("pais", formData.pais)
    data.append("ciudad", formData.ciudad)
    data.append("direccion", formData.direccion)
    data.append("telefono", formData.telefono)
    data.append("rol", formData.rol)
    data.append("is_active", String(formData.is_active))
    if (formData.imagen) {
      data.append("imagen", formData.imagen)
    }


    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        // No pongas 'Content-Type': lo setea automáticamente el navegador con boundary
      },
      body: data,
    })

    if (response.ok) {
      fetchUsers()
      setIsDialogOpen(false)
      resetForm()
    } else {
      console.error("Error al guardar el usuario:", await response.text())
    }
  } catch (error) {
    console.error("Error saving user:", error)
  }
}


  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      try {
        const token = localStorage.getItem("admin_token")
        const response = await fetch(`http://localhost:8000/usuarios/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          fetchUsers()
        }
      } catch (error) {
        console.error("Error deleting user:", error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      apellido: "",
      email: "",
      password: "",
      pais: "",
      ciudad: "",
      direccion: "",
      telefono: "",
      rol: "",
      imagen: null as File | null,
      is_active: true
    })
    setEditingUser(null)
  }

  const openEditDialog = (user: User) => {
    setEditingUser(user)
    setFormData({
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      password: "",
      pais: user.pais,
      ciudad: user.ciudad,
      direccion: user.direccion,
      telefono: user.telefono,
      rol: user.rol,
      imagen: null as File | null,
      is_active: user.is_active
    })
    setIsDialogOpen(true)
  }

const filteredUsers = users.filter(
  (user) =>
    user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.apellido.toLowerCase().includes(searchTerm.toLowerCase())
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
            Gestión de Usuarios
          </h2>
          <p className="text-gray-400 mt-1">Administra los usuarios del sistema</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={resetForm}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 shadow-lg shadow-cyan-500/25"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-cyan-400/50">
            <DialogHeader>
              <DialogTitle className="text-cyan-300">
                {editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {editingUser ? "Modifica los datos del usuario" : "Completa los datos para crear un nuevo usuario"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-cyan-300">
                    Usuario
                  </Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                    className="bg-gray-800/50 border-cyan-400/50 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido" className="text-cyan-300">
                    Apellido
                  </Label>
                  <Input
                    id="apellido"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    required
                    className="bg-gray-800/50 border-cyan-400/50 text-white"
                  />
                </div>
              </div>


              <div className="space-y-2">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-cyan-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    pattern="^[\w\.-]+@[\w\.-]+\.\w+$"
                    title="Debe ser un correo válido"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="bg-gray-800/50 border-cyan-400/50 text-white"
                  />
                </div>
                <Label htmlFor="password" className="text-cyan-300">
                  {editingUser ? "Nueva Contraseña (opcional)" : "Contraseña"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  className="bg-gray-800/50 border-cyan-400/50 text-white"
                />
                <div className="space-y-2">
                  <Label htmlFor="telefono" className="text-cyan-300">
                    Telefono
                  </Label>
                  <Input
                    id="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    required
                    className="bg-gray-800/50 border-cyan-400/50 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="direccion" className="text-cyan-300">
                    Direccion
                  </Label>
                  <Input
                    id="direccion"
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    required
                    className="bg-gray-800/50 border-cyan-400/50 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rol" className="text-cyan-300">
                    Rol
                  </Label>
                  <select
                    id="rol"
                    value={formData.rol}
                    onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                    required
                    className="bg-gray-800/50 border border-cyan-400/50 text-white px-3 py-2 rounded-md w-full"
                  >
                    <option value="">Seleccionar rol</option>
                    <option value="Cliente">Cliente</option>
                    <option value="Administrador">Administrador</option>
                  </select>
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
                    required={!editingUser}
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
                  {editingUser ? "Actualizar" : "Crear"}
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
              <CardTitle className="text-cyan-300">Lista de Usuarios</CardTitle>
              <CardDescription className="text-gray-400">
                {filteredUsers.length} usuario(s) encontrado(s)
              </CardDescription>
            </div>

            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar usuarios..."
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
                  <TableHead className="text-cyan-300">id</TableHead>
                  <TableHead className="text-cyan-300">Usuario</TableHead>
                  <TableHead className="text-cyan-300">Email</TableHead>
                  <TableHead className="text-cyan-300">Estado</TableHead>
                  <TableHead className="text-cyan-300">Modificar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-cyan-400/20 hover:bg-gray-700/30">
                    <TableCell className="text-white font-medium">{user.id}</TableCell>
                    <TableCell className="text-white font-medium">{user.nombre}</TableCell>
                    <TableCell className="text-gray-300">{user.email}</TableCell>

                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.is_active
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {user.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(user)}
                          className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(user.id)}
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
