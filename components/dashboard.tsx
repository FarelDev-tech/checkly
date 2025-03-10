"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Calendar, CheckCircle2, Clock, Home, CheckCheck, Menu, Plus, Search, Star, Trash2 } from "lucide-react"
import { format, addDays, isAfter, isSameDay } from "date-fns"
import { id } from "date-fns/locale"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import TaskItem from "./task-item"
import { cn } from "@/lib/utils"

export interface Task {
  id: string
  text: string
  completed: boolean
  createdAt: Date
  dueDate?: Date // Menambahkan field tenggat waktu
  priority: "low" | "medium" | "high"
  category: string
}

// Mendefinisikan tipe filter
type FilterType = "all" | "today" | "upcoming" | "completed" | "starred" | string

// Genenerate UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")
  const [filter, setFilter] = useState<FilterType>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [categories, setCategories] = useState<string[]>(["Pribadi", "Kerja", "Belanja", "Kesehatan"])
  const [selectedCategory, setSelectedCategory] = useState("Pribadi")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)

  // Memuat tugas dari localStorage saat komponen dimount
  useEffect(() => {
    const storedTasks = localStorage.getItem("tasks")
    if (storedTasks) {
      try {
        // Mengurai JSON yang tersimpan dan mengkonversi string tanggal kembali ke objek Date
        const parsedTasks = JSON.parse(storedTasks).map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        }))
        setTasks(parsedTasks)
      } catch (error) {
        console.error("Gagal mengurai tugas dari localStorage:", error)
      }
    }
  }, [])

  // Menyimpan tugas ke localStorage setiap kali berubah
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks))
  }, [tasks])

  // Menambahkan tugas baru
  const addTask = () => {
    if (newTask.trim() === "") return

    const newTaskItem: Task = {
      id: generateUUID(),
      text: newTask,
      completed: false,
      createdAt: new Date(),
      dueDate: dueDate,
      priority: "medium",
      category: selectedCategory,
    }

    setTasks([newTaskItem, ...tasks])
    setNewTask("")
    setDueDate(undefined)
  }

  // Mengubah status penyelesaian tugas
  const toggleTask = (id: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  // Menghapus tugas
  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  // Memperbarui prioritas tugas
  const updatePriority = (id: string, priority: "low" | "medium" | "high") => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, priority } : task)))
  }

  // Menangani pengiriman formulir
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addTask()
  }

  // Mengatur tenggat waktu untuk tugas baru
  const handleSetDueDate = (days: number) => {
    const date = addDays(new Date(), days)
    setDueDate(date)
  }

  // Memfilter tugas berdasarkan filter saat ini
  const filteredTasks = tasks.filter((task) => {
    // Pertama terapkan filter pencarian
    if (searchQuery && !task.text.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0) // Atur ke awal hari

    // Kemudian terapkan filter kategori/status
    if (filter === "all") return true
    if (filter === "completed") return task.completed
    if (filter === "today") {
      // Tampilkan tugas yang jatuh tempo hari ini atau tanpa tenggat waktu tetapi dibuat hari ini
      if (task.dueDate) {
        return isSameDay(task.dueDate, today) && !task.completed
      }
      return isSameDay(task.createdAt, today) && !task.completed
    }
    if (filter === "upcoming") {
      // Tampilkan tugas yang jatuh tempo di masa depan
      if (task.dueDate) {
        return isAfter(task.dueDate, today) && !task.completed
      }
      return false
    }
    if (filter === "starred") return task.priority === "high"

    // Filter berdasarkan kategori
    return task.category === filter
  })

  // Mendapatkan jumlah untuk badge
  const getCategoryCount = (category: string) => {
    return tasks.filter((task) => task.category === category && !task.completed).length
  }

  const getTodayCount = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return tasks.filter((task) => {
      if (task.completed) return false

      if (task.dueDate) {
        return isSameDay(task.dueDate, today)
      }
      return isSameDay(task.createdAt, today)
    }).length
  }

  const getUpcomingCount = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return tasks.filter((task) => {
      if (task.completed) return false

      if (task.dueDate) {
        return isAfter(task.dueDate, today)
      }
      return false
    }).length
  }

  const getCompletedCount = () => {
    return tasks.filter((task) => task.completed).length
  }

  const getStarredCount = () => {
    return tasks.filter((task) => task.priority === "high" && !task.completed).length
  }

  // Format tenggat waktu untuk tampilan
  const formatDueDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = addDays(today, 1)

    if (isSameDay(date, today)) {
      return "Hari ini"
    } else if (isSameDay(date, tomorrow)) {
      return "Besok"
    } else {
      return format(date, "d MMM", { locale: id })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-950 flex">
      {/* Sidebar - sekarang ditampilkan secara kondisional di perangkat mobile */}
      <div
        className={cn(
          "w-64 bg-slate-900/70 backdrop-blur-sm border-r border-slate-700/50 p-4 fixed inset-y-0 left-0 z-20 transition-transform duration-300 md:relative md:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-purple-600 rounded-lg p-2">
            <CheckCheck className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Checkly!
            <Badge variant="outline" className="bg-slate-800/50 text-white">Beta</Badge>
          </h1>
        </div>

        <div className="space-y-1 mb-6">
          <button
            onClick={() => {
              setFilter("all")
              setMobileMenuOpen(false)
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              filter === "all" ? "bg-purple-600/20 text-purple-400" : "text-slate-300 hover:bg-slate-800/70",
            )}
          >
            <Home className="h-4 w-4" />
            <span>Semua Tugas</span>
            <Badge variant="outline" className="ml-auto bg-slate-800/50 text-slate-300">
              {tasks.filter((t) => !t.completed).length}
            </Badge>
          </button>

          <button
            onClick={() => {
              setFilter("today")
              setMobileMenuOpen(false)
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              filter === "today" ? "bg-purple-600/20 text-purple-400" : "text-slate-300 hover:bg-slate-800/70",
            )}
          >
            <Clock className="h-4 w-4" />
            <span>Hari Ini</span>
            {getTodayCount() > 0 && (
              <Badge variant="outline" className="ml-auto bg-slate-800/50 text-slate-300">
                {getTodayCount()}
              </Badge>
            )}
          </button>

          <button
            onClick={() => {
              setFilter("upcoming")
              setMobileMenuOpen(false)
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              filter === "upcoming" ? "bg-purple-600/20 text-purple-400" : "text-slate-300 hover:bg-slate-800/70",
            )}
          >
            <Calendar className="h-4 w-4" />
            <span>Mendatang</span>
            {getUpcomingCount() > 0 && (
              <Badge variant="outline" className="ml-auto bg-slate-800/50 text-slate-300">
                {getUpcomingCount()}
              </Badge>
            )}
          </button>

          <button
            onClick={() => {
              setFilter("completed")
              setMobileMenuOpen(false)
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              filter === "completed" ? "bg-purple-600/20 text-purple-400" : "text-slate-300 hover:bg-slate-800/70",
            )}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Selesai</span>
            {getCompletedCount() > 0 && (
              <Badge variant="outline" className="ml-auto bg-slate-800/50 text-slate-300">
                {getCompletedCount()}
              </Badge>
            )}
          </button>

          <button
            onClick={() => {
              setFilter("starred")
              setMobileMenuOpen(false)
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              filter === "starred" ? "bg-purple-600/20 text-purple-400" : "text-slate-300 hover:bg-slate-800/70",
            )}
          >
            <Star className="h-4 w-4" />
            <span>Berbintang</span>
            {getStarredCount() > 0 && (
              <Badge variant="outline" className="ml-auto bg-slate-800/50 text-slate-300">
                {getStarredCount()}
              </Badge>
            )}
          </button>
        </div>

        <div className="mb-2">
          <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider px-3 mb-2">Kategori</h2>
          <div className="space-y-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setFilter(category)
                  setMobileMenuOpen(false)
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  filter === category ? "bg-purple-600/20 text-purple-400" : "text-slate-300 hover:bg-slate-800/70",
                )}
              >
                <span>{category}</span>
                {getCategoryCount(category) > 0 && (
                  <Badge variant="outline" className="ml-auto bg-slate-800/50 text-slate-300">
                    {getCategoryCount(category)}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overlay untuk menu mobile */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-10 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Konten utama */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-slate-900/70 backdrop-blur-sm border-b border-slate-700/50 px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-300"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari tugas..."
                className="pl-8 bg-slate-800/50 border-slate-700 text-slate-300 placeholder:text-slate-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-slate-300 text-sm font-medium">{format(new Date(), "EEEE, d MMMM", { locale: id })}</p>
              <p className="text-slate-400 text-xs">{tasks.filter((t) => !t.completed).length} tugas aktif</p>
            </div>
          </div>
        </header>

        {/* Konten tugas */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold text-white">
                {filter === "all"
                  ? "Semua Tugas"
                  : filter === "today"
                    ? "Tugas Hari Ini"
                    : filter === "upcoming"
                      ? "Tugas Mendatang"
                      : filter === "completed"
                        ? "Tugas Selesai"
                        : filter === "starred"
                          ? "Tugas Berbintang"
                          : `Tugas ${filter}`}
              </h1>

              {tasks.length > 0 && filter === "completed" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-slate-300 border-slate-700 bg-slate-800"
                  onClick={() => setTasks(tasks.filter((task) => !task.completed))}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus Selesai
                </Button>
              )}
            </div>

            {/* Formulir tambah tugas */}
            <form onSubmit={handleSubmit} className="mb-6">
              <div className="flex flex-col gap-2 p-3 bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      placeholder="Tambah tugas baru..."
                      className="border-0 bg-transparent text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto text-sm"
                    />
                  </div>
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <select
                    className="text-xs bg-slate-700/50 text-slate-300 rounded px-2 py-1 border-0"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1 ml-auto">
                    <span className="text-xs text-slate-400">Tenggat:</span>
                    <button
                      type="button"
                      onClick={() => handleSetDueDate(0)}
                      className={cn(
                        "text-xs px-2 py-1 rounded",
                        dueDate && isSameDay(dueDate, new Date())
                          ? "bg-purple-600/50 text-purple-200"
                          : "bg-slate-700/50 text-slate-300 hover:bg-slate-700",
                      )}
                    >
                      Hari ini
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetDueDate(1)}
                      className={cn(
                        "text-xs px-2 py-1 rounded",
                        dueDate && isSameDay(dueDate, addDays(new Date(), 1))
                          ? "bg-purple-600/50 text-purple-200"
                          : "bg-slate-700/50 text-slate-300 hover:bg-slate-700",
                      )}
                    >
                      Besok
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetDueDate(7)}
                      className={cn(
                        "text-xs px-2 py-1 rounded",
                        dueDate && isSameDay(dueDate, addDays(new Date(), 7))
                          ? "bg-purple-600/50 text-purple-200"
                          : "bg-slate-700/50 text-slate-300 hover:bg-slate-700",
                      )}
                    >
                      1 Minggu
                    </button>
                  </div>
                </div>

                {dueDate && (
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-slate-400">Tenggat waktu: {formatDueDate(dueDate)}</span>
                    <button
                      type="button"
                      className="text-xs text-red-400 ml-2 hover:text-red-300"
                      onClick={() => setDueDate(undefined)}
                    >
                      Hapus
                    </button>
                  </div>
                )}
              </div>
            </form>

            {/* Daftar tugas */}
            <div className="space-y-3">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800/50 mb-4">
                    <CheckCheck className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-slate-300 font-medium mb-1">Tidak ada tugas</h3>
                  <p className="text-slate-400 text-sm">
                    {filter === "all" ? "Tambahkan tugas baru untuk memulai" : "Coba ubah filter Anda"}
                  </p>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  {filteredTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={toggleTask}
                      onDelete={deleteTask}
                      onUpdatePriority={updatePriority}
                      formatDueDate={formatDueDate}
                    />
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

