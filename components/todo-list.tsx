"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { PlusCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import TodoItem from "./todo-item"

interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: Date
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")

  // Memuat data todo dari localStorage saat komponen pertama kali dimuat
  useEffect(() => {
    const storedTodos = localStorage.getItem("todos")
    if (storedTodos) {
      try {
        const parsedTodos = JSON.parse(storedTodos).map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
        }))
        setTodos(parsedTodos)
      } catch (error) {
        console.error("Gagal mengurai todos dari localStorage:", error)
      }
    }
  }, [])

  // Menyimpan data todos ke localStorage setiap kali terjadi perubahan
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos))
  }, [todos])

  // Menambahkan todo baru
  const addTodo = () => {
    if (newTodo.trim() === "") return

    const newTodoItem: Todo = {
      id: crypto.randomUUID(),
      text: newTodo,
      completed: false,
      createdAt: new Date(),
    }

    setTodos([newTodoItem, ...todos])
    setNewTodo("")
  }

  // Mengubah status selesai (completed) pada todo tertentu
  const toggleTodo = (id: string) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
  }

  // Menghapus todo tertentu
  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  // Menangani submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addTodo()
  }

  return (
    <div className="w-full max-w-md mx-auto bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-slate-700/50">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Task Manager</h1>

        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
          <Input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Tambahkan tugas baru..."
            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
          />
          <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
            <PlusCircle className="h-5 w-5" />
          </Button>
        </form>

        <div className="space-y-3">
          <AnimatePresence>
            {todos.length === 0 ? (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-400 text-center py-6">
                Belum ada tugas. Tambahkan di atas!
              </motion.p>
            ) : (
              todos.map((todo) => <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} />)
            )}
          </AnimatePresence>
        </div>

        {todos.length > 0 && (
          <div className="mt-6 text-sm text-slate-400 flex justify-between">
            <span>
              {todos.filter((todo) => todo.completed).length} dari {todos.length} tugas selesai
            </span>
            <button onClick={() => setTodos([])} className="text-purple-400 hover:text-purple-300 transition-colors">
              Hapus Semua
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
