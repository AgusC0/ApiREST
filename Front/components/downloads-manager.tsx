"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Download, Search, FileText, ImageIcon, Archive, File } from "lucide-react"

interface DownloadFile {
  id: number
  filename: string
  original_name: string
  file_size: number
  file_type: string
  download_count: number
  created_at: string
  is_active: boolean
}

export default function DownloadsManager() {
  const [files, setFiles] = useState<DownloadFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem("admin_token")
      const response = await fetch("http://localhost:8000/descargas", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setFiles(data)
      }
    } catch (error) {
      console.error("Error fetching files:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async (filename: string, originalName: string) => {
    try {
      const token = localStorage.getItem("admin_token")
      const response = await fetch(`http://localhost:8000/descargas/${filename}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = originalName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        // Refresh the list to update download count
        fetchFiles()
      }
    } catch (error) {
      console.error("Error downloading file:", error)
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return ImageIcon
    if (fileType.includes("pdf") || fileType.includes("document")) return FileText
    if (fileType.includes("zip") || fileType.includes("rar")) return Archive
    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const filteredFiles = files.filter(
    (file) =>
      file.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.file_type.toLowerCase().includes(searchTerm.toLowerCase()),
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
            Centro de Descargas
          </h2>
          <p className="text-gray-400 mt-1">Gestiona y descarga archivos del sistema</p>
        </div>
      </div>

      <Card className="bg-gray-800/50 border-cyan-400/30">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-cyan-300">Archivos Disponibles</CardTitle>
              <CardDescription className="text-gray-400">
                {filteredFiles.length} archivo(s) encontrado(s)
              </CardDescription>
            </div>

            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar archivos..."
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
                  <TableHead className="text-cyan-300">Archivo</TableHead>
                  <TableHead className="text-cyan-300">Tipo</TableHead>
                  <TableHead className="text-cyan-300">Tamaño</TableHead>
                  <TableHead className="text-cyan-300">Descargas</TableHead>
                  <TableHead className="text-cyan-300">Fecha</TableHead>
                  <TableHead className="text-cyan-300">Estado</TableHead>
                  <TableHead className="text-cyan-300">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles.map((file) => {
                  const FileIcon = getFileIcon(file.file_type)
                  return (
                    <TableRow key={file.id} className="border-cyan-400/20 hover:bg-gray-700/30">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg">
                            <FileIcon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="text-white font-medium">{file.original_name}</div>
                            <div className="text-gray-400 text-sm">{file.filename}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          {file.file_type}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-300">{formatFileSize(file.file_size)}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          {file.download_count} descargas
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-300">{new Date(file.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            file.is_active
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {file.is_active ? "Disponible" : "No disponible"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleDownload(file.filename, file.original_name)}
                          disabled={!file.is_active}
                          className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Descargar
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {filteredFiles.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg">No se encontraron archivos</div>
              <div className="text-gray-500 text-sm mt-1">
                {searchTerm ? "Intenta con otros términos de búsqueda" : "No hay archivos disponibles para descargar"}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
