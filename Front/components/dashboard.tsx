"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, Users, Package, FolderOpen, ShoppingCart, Download, Menu, X } from "lucide-react"
import UsersManager from "./users-manager"
import ProductsManager from "./products-manager"
import CategoriesManager from "./categories-manager"
import SalesManager from "./sales-manager"
import DownloadsManager from "./downloads-manager"

interface DashboardProps {
  onLogout: () => void
}

type ActiveSection = "overview" | "users" | "products" | "categories" | "sales" | "downloads"

export default function Dashboard({ onLogout }: DashboardProps) {
  const [activeSection, setActiveSection] = useState<ActiveSection>("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    onLogout()
  }

  const menuItems = [
    { id: "overview" as const, label: "Resumen", icon: Menu },
    { id: "users" as const, label: "Usuarios", icon: Users },
    { id: "products" as const, label: "Productos", icon: Package },
    { id: "categories" as const, label: "Categorías", icon: FolderOpen },
    { id: "sales" as const, label: "Ventas", icon: ShoppingCart },
    { id: "downloads" as const, label: "Descargas", icon: Download },
  ]

  const renderContent = () => {
    switch (activeSection) {
      case "users":
        return <UsersManager />
      case "products":
        return <ProductsManager />
      case "categories":
        return <CategoriesManager />
      case "sales":
        return <SalesManager />
      case "downloads":
        return <DownloadsManager />
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.slice(1).map((item) => {
              const Icon = item.icon
              return (
                <Card
                  key={item.id}
                  className="bg-gray-800/50 border-cyan-400/30 hover:border-cyan-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/25 cursor-pointer group"
                  onClick={() => setActiveSection(item.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg group-hover:shadow-lg group-hover:shadow-cyan-400/50 transition-all duration-300">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-cyan-300 group-hover:text-cyan-200 transition-colors">
                        {item.label}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-400">Gestionar {item.label.toLowerCase()}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Header */}
      <header className="bg-gray-900/80 border-b border-cyan-400/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-cyan-400 hover:text-cyan-300"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              FastAPI Admin
            </h1>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-400"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-64 bg-gray-900/90 border-r border-cyan-400/30 backdrop-blur-sm transition-transform duration-300 ease-in-out`}
        >
          <nav className="p-4 space-y-2 mt-4">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/25"
                      : "text-gray-300 hover:text-cyan-300 hover:bg-gray-800/50"
                  }`}
                  onClick={() => {
                    setActiveSection(item.id)
                    setSidebarOpen(false)
                  }}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Button>
              )
            })}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>
    </div>
  )
}
