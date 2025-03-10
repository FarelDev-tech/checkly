"use client"

import { motion } from "framer-motion"
import { Trash2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: Date
}

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export default function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  // Format tanggal
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(todo.createdAt)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <Button
          size="icon"
          variant="outline"
          className={cn(
            "h-6 w-6 rounded-full border-slate-500 shrink-0 mt-0.5",
            todo.completed && "bg-purple-600 border-purple-600 text-white hover:bg-purple-700 hover:border-purple-700",
          )}
          onClick={() => onToggle(todo.id)}
        >
          {todo.completed && <Check className="h-3 w-3" />}
        </Button>

        <div className="flex-1 min-w-0">
          <p className={cn("text-white break-words", todo.completed && "line-through text-slate-400")}>{todo.text}</p>
          <p className="text-xs text-slate-400 mt-1">{formattedDate}</p>
        </div>

        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-slate-400 hover:text-red-400 hover:bg-red-400/10"
          onClick={() => onDelete(todo.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  )
}

