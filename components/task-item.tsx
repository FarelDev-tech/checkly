"use client"

import { useState } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { motion } from "framer-motion"
import { Check, MoreVertical, Star, Trash2, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { Task } from "./dashboard"

interface TaskItemProps {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onUpdatePriority: (id: string, priority: "low" | "medium" | "high") => void
  formatDueDate: (date: Date) => string
}

export default function TaskItem({ task, onToggle, onDelete, onUpdatePriority, formatDueDate }: TaskItemProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Format tanggal ke string yang mudah dibaca
  const formattedDate = format(task.createdAt, "d MMM, HH:mm", { locale: id })

  // Warna Berbintang untuk prioritas
  const getPriorityColor = () => {
    switch (task.priority) {
      case "high":
        return "text-amber-400"
      case "medium":
        return "text-blue-400"
      case "low":
        return "text-slate-400"
      default:
        return "text-slate-400"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 transition-all",
        isHovered && "bg-slate-800/70",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Button
            size="icon"
            variant="outline"
            className={cn(
              "h-5 w-5 rounded-full border-slate-600 shrink-0 mt-0.5",
              task.completed &&
                "bg-purple-600 border-purple-600 text-white hover:bg-purple-700 hover:border-purple-700",
            )}
            onClick={() => onToggle(task.id)}
          >
            {task.completed && <Check className="h-3 w-3" />}
          </Button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <p className={cn("text-white break-words", task.completed && "line-through text-slate-400")}>
                {task.text}
              </p>
              <div className="flex items-center ml-2">
                {task.priority === "high" && <Star className="h-4 w-4 text-amber-400 fill-amber-400" />}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 bg-slate-800 border-slate-700 text-slate-300">
                    <DropdownMenuItem
                      className="hover:bg-slate-700 hover:text-slate-200 cursor-pointer"
                      onClick={() => onUpdatePriority(task.id, "high")}
                    >
                      <Star
                        className={cn(
                          "h-4 w-4 mr-2",
                          task.priority === "high" ? "text-amber-400 fill-amber-400" : "text-slate-400",
                        )}
                      />
                      <span>Prioritas Tinggi</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="hover:bg-slate-700 hover:text-slate-200 cursor-pointer"
                      onClick={() => onUpdatePriority(task.id, "medium")}
                    >
                      <Star
                        className={cn("h-4 w-4 mr-2", task.priority === "medium" ? "text-blue-400" : "text-slate-400")}
                      />
                      <span>Prioritas Sedang</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="hover:bg-slate-700 hover:text-slate-200 cursor-pointer"
                      onClick={() => onUpdatePriority(task.id, "low")}
                    >
                      <Star
                        className={cn("h-4 w-4 mr-2", task.priority === "low" ? "text-slate-400" : "text-slate-400")}
                      />
                      <span>Prioritas Rendah</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-700" />
                    <DropdownMenuItem
                      className="text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer"
                      onClick={() => onDelete(task.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      <span>Hapus</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-400">{formattedDate}</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-700/50 text-slate-400">{task.category}</span>
              {task.dueDate && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-900/50 text-purple-300 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDueDate(task.dueDate)}
                </span>
              )}
              <Star className={cn("h-3 w-3", getPriorityColor())} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

