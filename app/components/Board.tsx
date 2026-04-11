"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { DndContext, closestCenter, DragEndEvent, useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, GripVertical, Sparkles } from "lucide-react";

const supabase = createClient(
  "https://nfoerfezojunroqggysf.supabase.co",
  "sb_publishable_4nRrXieWO_xGcr8jHzlmRQ_nI1uFXA7"
);

const columns = [
  { id: "todo", title: "📋 To Do", accent: "border-purple-500/50" },
  { id: "progress", title: "🔄 In Progress", accent: "border-blue-500/50" },
  { id: "done", title: "✅ Done", accent: "border-green-500/50" },
];

function DroppableColumn({ id, children, accent }: { id: string; children: React.ReactNode; accent: string }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`transition-all duration-200 rounded-2xl ${isOver ? `ring-2 ${accent} ring-opacity-50 shadow-lg` : ""}`}
    >
      {children}
    </div>
  );
}

function SortableTask({ task, onDelete }: { task: any; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      whileDrag={{ rotate: 2, scale: 1.02 }}
      className="task-card bg-gray-900/60 backdrop-blur-sm rounded-xl p-3 border border-gray-700 group hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-200 cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center gap-2">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-800 transition">
          <GripVertical size={16} className="text-gray-500 group-hover:text-purple-400 transition" />
        </div>
        <p className="text-white text-sm flex-1 font-medium">{task.title}</p>
        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-500/20 rounded-lg"
        >
          <Trash2 size={14} className="text-red-400" />
        </button>
      </div>
    </motion.div>
  );
}

export default function Board() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState("");
  const [addingTo, setAddingTo] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const { data } = await supabase.from("tasks").select("*").order("created_at", { ascending: true });
    if (data) setTasks(data);
    setLoading(false);
  };

  const addTask = async (status: string) => {
    if (!newTask.trim()) return;

    const { data } = await supabase
      .from("tasks")
      .insert([{ title: newTask, status }])
      .select();
    if (data) {
      setTasks([...tasks, data[0]]);
      setNewTask("");
      setAddingTo(null);
    }
  };

  const deleteTask = async (id: string) => {
    await supabase.from("tasks").delete().eq("id", id);
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;

    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;

    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    await supabase.from("tasks").update({ status: newStatus }).eq("id", taskId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="w-12 h-12 border-3 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-purple-400 w-4 h-4" />
        </div>
      </div>
    );
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid md:grid-cols-3 gap-6">
        {columns.map((column) => (
          <DroppableColumn key={column.id} id={column.id} accent={column.accent}>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 transition-all duration-300 hover:shadow-lg hover:border-white/20">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${column.id === "todo" ? "from-purple-500 to-purple-600" : column.id === "progress" ? "from-blue-500 to-blue-600" : "from-green-500 to-green-600"}`} />
                  <h2 className="text-white font-semibold tracking-wide text-sm uppercase">{column.title}</h2>
                  <span className="text-gray-400 text-xs bg-white/10 px-2 py-0.5 rounded-full">
                    {tasks.filter(t => t.status === column.id).length}
                  </span>
                </div>
                <button
                  onClick={() => setAddingTo(column.id)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-110"
                >
                  <Plus size={16} className="text-gray-400 hover:text-purple-400 transition" />
                </button>
              </div>

              {/* Add Task Input */}
              <AnimatePresence>
                {addingTo === column.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 overflow-hidden"
                  >
                    <input
                      type="text"
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      placeholder="Task title..."
                      className="w-full px-3 py-2 bg-gray-900/80 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addTask(column.id);
                        if (e.key === "Escape") setAddingTo(null);
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tasks */}
              <SortableContext
                items={tasks.filter(t => t.status === column.id).map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2 min-h-[200px]">
                  <AnimatePresence>
                    {tasks
                      .filter(t => t.status === column.id)
                      .map((task) => (
                        <SortableTask key={task.id} task={task} onDelete={deleteTask} />
                      ))}
                  </AnimatePresence>
                  
                  {tasks.filter(t => t.status === column.id).length === 0 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-gray-500 text-sm text-center py-8"
                    >
                      No tasks
                    </motion.p>
                  )}
                </div>
              </SortableContext>
            </div>
          </DroppableColumn>
        ))}
      </div>
    </DndContext>
  );
}