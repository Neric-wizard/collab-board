"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { DndContext, closestCenter, DragEndEvent, useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  Plus, Trash2, GripVertical, Sparkles, Calendar, X, Check, Flag, User, AlignLeft,
  Search, Filter, BarChart3, Trophy
} from "lucide-react";

const supabase = createClient(
  "https://nfoerfezojunroqggysf.supabase.co",
  "sb_publishable_4nRrXieWO_xGcr8jHzlmRQ_nI1uFXA7"
);

const columns = [
  { id: "todo", title: "📋 To Do", accent: "border-purple-500/50", gradient: "from-purple-500 to-purple-600" },
  { id: "progress", title: "🔄 In Progress", accent: "border-blue-500/50", gradient: "from-blue-500 to-blue-600" },
  { id: "done", title: "✅ Done", accent: "border-green-500/50", gradient: "from-green-500 to-green-600" },
];

const priorities = [
  { value: "high", label: "🔴 High", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  { value: "medium", label: "🟡 Medium", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  { value: "low", label: "🟢 Low", color: "bg-green-500/20 text-green-400 border-green-500/30" },
];

const assignees = [
  { name: "Neric", avatar: "NN", color: "from-purple-500 to-pink-500" },
  { name: "Sarah", avatar: "SC", color: "from-blue-500 to-cyan-500" },
  { name: "Alex", avatar: "AJ", color: "from-green-500 to-emerald-500" },
];

function DroppableColumn({ id, children, accent }: { id: string; children: React.ReactNode; accent: string }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`transition-all duration-200 rounded-2xl ${isOver ? `ring-2 ${accent} ring-opacity-50 shadow-lg scale-[1.01]` : ""}`}
    >
      {children}
    </div>
  );
}

function getDueDateColor(dueDate: string | null) {
  if (!dueDate) return "bg-gray-500/20 text-gray-400";
  const today = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return "bg-red-500/20 text-red-400 border-red-500/30";
  if (diffDays === 0) return "bg-orange-500/20 text-orange-400 border-orange-500/30";
  if (diffDays <= 3) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  return "bg-green-500/20 text-green-400 border-green-500/30";
}

function formatDueDate(dueDate: string | null) {
  if (!dueDate) return null;
  const date = new Date(dueDate);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function triggerConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#a855f7', '#ec4899', '#8b5cf6', '#d946ef']
  });
}

function SortableTask({ task, onDelete, onEdit, onUpdateDueDate, onUpdatePriority, onUpdateAssignee, onUpdateDescription }: { 
  task: any; 
  onDelete: (id: string) => void; 
  onEdit: (id: string, newTitle: string) => void;
  onUpdateDueDate: (id: string, dueDate: string | null) => void;
  onUpdatePriority: (id: string, priority: string) => void;
  onUpdateAssignee: (id: string, assignee: string) => void;
  onUpdateDescription: (id: string, description: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showAssigneeMenu, setShowAssigneeMenu] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [editDescription, setEditDescription] = useState(task.description || "");
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const handleSave = () => {
    if (editTitle.trim() && editTitle !== task.title) {
      onEdit(task.id, editTitle);
    }
    setIsEditing(false);
  };

  const saveDescription = () => {
    onUpdateDescription(task.id, editDescription);
    setShowDescription(false);
  };

  const dueDateColor = getDueDateColor(task.due_date);
  const formattedDate = formatDueDate(task.due_date);
  const priority = priorities.find(p => p.value === task.priority) || priorities[1];
  const assignee = assignees.find(a => a.name === task.assignee);

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      whileDrag={{ rotate: 2, scale: 1.02 }}
      className="task-card bg-gray-900/60 backdrop-blur-sm rounded-xl p-3 border border-gray-700 group hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-200"
    >
      <div className="flex flex-col gap-2">
        {/* Title Row */}
        <div className="flex items-center gap-2">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-800 transition">
            <GripVertical size={16} className="text-gray-500 group-hover:text-purple-400 transition" />
          </div>
          
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") setIsEditing(false);
              }}
              className="flex-1 text-white text-sm bg-gray-800 border border-purple-500 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
              autoFocus
            />
          ) : (
            <p className="text-white text-sm flex-1 font-medium cursor-pointer hover:text-purple-400 transition" onClick={() => setIsEditing(true)}>
              {task.title}
            </p>
          )}
          
          <button
            onClick={() => onDelete(task.id)}
            className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-500/20 rounded-lg"
          >
            <Trash2 size={14} className="text-red-400" />
          </button>
        </div>

        {/* Description */}
        <div className="ml-7">
          <button
            onClick={() => setShowDescription(!showDescription)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-purple-400 transition"
          >
            <AlignLeft size={12} />
            {task.description ? "Edit description" : "Add description"}
          </button>
          {showDescription && (
            <div className="mt-2">
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Task description..."
                rows={2}
                className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                autoFocus
              />
              <div className="flex gap-2 mt-1">
                <button onClick={saveDescription} className="text-xs text-green-400 hover:text-green-300">Save</button>
                <button onClick={() => setShowDescription(false)} className="text-xs text-gray-500 hover:text-gray-400">Cancel</button>
              </div>
            </div>
          )}
          {task.description && !showDescription && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>
        
        {/* Meta Row */}
        <div className="flex items-center flex-wrap gap-2 ml-7">
          {/* Priority */}
          <div className="relative">
            <button
              onClick={() => setShowPriorityMenu(!showPriorityMenu)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${priority.color}`}
            >
              <Flag size={10} />
              {priority.label}
            </button>
            {showPriorityMenu && (
              <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                {priorities.map(p => (
                  <button
                    key={p.value}
                    onClick={() => {
                      onUpdatePriority(task.id, p.value);
                      setShowPriorityMenu(false);
                    }}
                    className={`block w-full text-left px-3 py-1 text-xs ${p.color} hover:bg-gray-700 rounded-lg`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Due Date */}
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-800/50 hover:bg-gray-700 transition text-xs"
            >
              <Calendar size={12} className="text-gray-400" />
              <span className="text-gray-400 text-xs">Due</span>
            </button>
            {formattedDate && (
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md ${dueDateColor} text-xs font-medium border`}>
                <span>📅</span>
                {formattedDate}
                <button onClick={() => onUpdateDueDate(task.id, null)} className="ml-1 hover:opacity-70">
                  <X size={10} />
                </button>
              </div>
            )}
            {showDatePicker && (
              <input
                type="date"
                value={task.due_date?.split('T')[0] || ""}
                onChange={(e) => {
                  onUpdateDueDate(task.id, e.target.value);
                  setShowDatePicker(false);
                }}
                className="absolute top-0 left-0 w-32 px-2 py-1 bg-gray-800 border border-purple-500 rounded text-white text-xs focus:outline-none"
                autoFocus
                onBlur={() => setShowDatePicker(false)}
              />
            )}
          </div>

          {/* Assignee */}
          <div className="relative">
            <button
              onClick={() => setShowAssigneeMenu(!showAssigneeMenu)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-800/50 hover:bg-gray-700 transition text-xs"
            >
              <User size={12} className="text-gray-400" />
              <span className="text-gray-400 text-xs">Assign</span>
            </button>
            {assignee && (
              <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${assignee.color} flex items-center justify-center text-white font-bold text-xs`}>
                {assignee.avatar}
              </div>
            )}
            {showAssigneeMenu && (
              <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                {assignees.map(a => (
                  <button
                    key={a.name}
                    onClick={() => {
                      onUpdateAssignee(task.id, a.name);
                      setShowAssigneeMenu(false);
                    }}
                    className="flex items-center gap-2 px-3 py-1 text-xs text-white hover:bg-gray-700 rounded-lg w-full"
                  >
                    <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${a.color} flex items-center justify-center text-white font-bold text-[10px]`}>
                      {a.avatar}
                    </div>
                    {a.name}
                  </button>
                ))}
                <button
                  onClick={() => {
                    onUpdateAssignee(task.id, "");
                    setShowAssigneeMenu(false);
                  }}
                  className="block w-full text-left px-3 py-1 text-xs text-gray-400 hover:bg-gray-700 rounded-lg"
                >
                  Unassign
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Board() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [columnInputs, setColumnInputs] = useState<{
    [key: string]: { title: string; dueDate: string; showDatePicker: boolean; description: string; priority: string; assignee: string };
  }>({
    todo: { title: "", dueDate: "", showDatePicker: false, description: "", priority: "medium", assignee: "" },
    progress: { title: "", dueDate: "", showDatePicker: false, description: "", priority: "medium", assignee: "" },
    done: { title: "", dueDate: "", showDatePicker: false, description: "", priority: "medium", assignee: "" },
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const { data } = await supabase.from("tasks").select("*").order("created_at", { ascending: true });
    if (data) setTasks(data);
    setLoading(false);
  };

  const updateColumnInput = (columnId: string, updates: Partial<any>) => {
    setColumnInputs(prev => ({
      ...prev,
      [columnId]: { ...prev[columnId], ...updates }
    }));
  };

  const addTask = async (columnId: string) => {
    const input = columnInputs[columnId];
    if (!input.title.trim()) return;

    const insertData: any = { 
      title: input.title, 
      status: columnId,
      description: input.description,
      priority: input.priority,
      assignee: input.assignee,
    };
    if (input.dueDate) insertData.due_date = input.dueDate;

    const { data } = await supabase
      .from("tasks")
      .insert(insertData)
      .select();
    if (data) {
      setTasks([...tasks, data[0]]);
      updateColumnInput(columnId, { title: "", dueDate: "", showDatePicker: false, description: "", priority: "medium", assignee: "" });
    }
  };

  const deleteTask = async (id: string) => {
    await supabase.from("tasks").delete().eq("id", id);
    setTasks(tasks.filter(t => t.id !== id));
  };

  const updateTaskTitle = async (id: string, newTitle: string) => {
    await supabase.from("tasks").update({ title: newTitle }).eq("id", id);
    setTasks(tasks.map(t => t.id === id ? { ...t, title: newTitle } : t));
  };

  const updateTaskDueDate = async (id: string, dueDate: string | null) => {
    await supabase.from("tasks").update({ due_date: dueDate }).eq("id", id);
    setTasks(tasks.map(t => t.id === id ? { ...t, due_date: dueDate } : t));
  };

  const updateTaskPriority = async (id: string, priority: string) => {
    await supabase.from("tasks").update({ priority }).eq("id", id);
    setTasks(tasks.map(t => t.id === id ? { ...t, priority } : t));
  };

  const updateTaskAssignee = async (id: string, assignee: string) => {
    await supabase.from("tasks").update({ assignee }).eq("id", id);
    setTasks(tasks.map(t => t.id === id ? { ...t, assignee } : t));
  };

  const updateTaskDescription = async (id: string, description: string) => {
    await supabase.from("tasks").update({ description }).eq("id", id);
    setTasks(tasks.map(t => t.id === id ? { ...t, description } : t));
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
    
    // Trigger confetti when task moves to Done
    if (newStatus === "done") {
      triggerConfetti();
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterPriority !== "all" && task.priority !== filterPriority) return false;
    if (filterAssignee !== "all" && task.assignee !== filterAssignee) return false;
    return true;
  });

  // Stats
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(t => t.status === "done").length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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
    <>
      {/* Stats Bar */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 mb-6 border border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-purple-400" />
              <span className="text-white text-sm">Total: {totalTasks}</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-green-400" />
              <span className="text-white text-sm">Completed: {completedTasks}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <span className="text-white text-sm">{completionRate}%</span>
            </div>
          </div>
          
          {/* Search and Filter */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tasks..."
                className="pl-9 pr-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 w-48"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-400 text-sm hover:text-purple-400 transition"
            >
              <Filter size={14} />
              Filter
            </button>
          </div>
        </div>
        
        {/* Filter Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-700 flex flex-wrap gap-4"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Priority:</span>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-xs"
              >
                <option value="all">All</option>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Assignee:</span>
              <select
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-xs"
              >
                <option value="all">All</option>
                <option value="Neric">Neric</option>
                <option value="Sarah">Sarah</option>
                <option value="Alex">Alex</option>
              </select>
            </div>
            <button
              onClick={() => {
                setFilterPriority("all");
                setFilterAssignee("all");
                setSearchTerm("");
              }}
              className="text-xs text-purple-400 hover:text-purple-300"
            >
              Clear filters
            </button>
          </motion.div>
        )}
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid md:grid-cols-3 gap-6">
          {columns.map((column) => {
            const columnTasks = filteredTasks.filter(t => t.status === column.id);
            const input = columnInputs[column.id];
            
            return (
              <DroppableColumn key={column.id} id={column.id} accent={column.accent}>
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 transition-all duration-300 hover:shadow-lg hover:border-white/20">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${column.gradient}`} />
                      <h2 className="text-white font-semibold tracking-wide text-sm uppercase">{column.title}</h2>
                      <span className="text-gray-400 text-xs bg-white/10 px-2 py-0.5 rounded-full">
                        {columnTasks.length}
                      </span>
                    </div>
                    <button
                      onClick={() => updateColumnInput(column.id, { title: "", dueDate: "", showDatePicker: false, description: "", priority: "medium", assignee: "" })}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-110"
                    >
                      <Plus size={16} className="text-gray-400 hover:text-purple-400 transition" />
                    </button>
                  </div>

                  {/* Add Task Input */}
                  <AnimatePresence>
                    {input && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 overflow-hidden space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={input.title}
                            onChange={(e) => updateColumnInput(column.id, { title: e.target.value })}
                            placeholder="Task title..."
                            className="flex-1 px-3 py-2 bg-gray-900/80 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") addTask(column.id);
                              if (e.key === "Escape") updateColumnInput(column.id, { title: "", dueDate: "", showDatePicker: false, description: "", priority: "medium", assignee: "" });
                            }}
                            autoFocus
                          />
                          <button
                            onClick={() => updateColumnInput(column.id, { title: "", dueDate: "", showDatePicker: false, description: "", priority: "medium", assignee: "" })}
                            className="p-2 hover:bg-gray-700/50 rounded-lg transition"
                          >
                            <X size={16} className="text-gray-400 hover:text-white" />
                          </button>
                        </div>
                        
                        <textarea
                          value={input.description}
                          onChange={(e) => updateColumnInput(column.id, { description: e.target.value })}
                          placeholder="Task description (optional)"
                          rows={2}
                          className="w-full px-3 py-2 bg-gray-900/80 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />

                        <div className="flex items-center flex-wrap gap-2">
                          <select
                            value={input.priority}
                            onChange={(e) => updateColumnInput(column.id, { priority: e.target.value })}
                            className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-xs"
                          >
                            <option value="high">🔴 High</option>
                            <option value="medium">🟡 Medium</option>
                            <option value="low">🟢 Low</option>
                          </select>

                          <button
                            onClick={() => updateColumnInput(column.id, { showDatePicker: !input.showDatePicker })}
                            className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-800/50 hover:bg-gray-700 transition text-xs"
                          >
                            <Calendar size={12} className="text-gray-400" />
                            <span className="text-gray-400 text-xs">Due date</span>
                          </button>
                          
                          {input.showDatePicker && (
                            <input
                              type="date"
                              value={input.dueDate}
                              onChange={(e) => updateColumnInput(column.id, { dueDate: e.target.value })}
                              className="px-2 py-1 bg-gray-800 border border-purple-500 rounded text-white text-xs"
                            />
                          )}

                          <select
                            value={input.assignee}
                            onChange={(e) => updateColumnInput(column.id, { assignee: e.target.value })}
                            className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-xs"
                          >
                            <option value="">Unassigned</option>
                            <option value="Neric">👤 Neric</option>
                            <option value="Sarah">👤 Sarah</option>
                            <option value="Alex">👤 Alex</option>
                          </select>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Tasks */}
                  <SortableContext
                    items={columnTasks.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2 min-h-[200px]">
                      <AnimatePresence>
                        {columnTasks.map((task) => (
                          <SortableTask 
                            key={task.id} 
                            task={task} 
                            onDelete={deleteTask} 
                            onEdit={updateTaskTitle}
                            onUpdateDueDate={updateTaskDueDate}
                            onUpdatePriority={updateTaskPriority}
                            onUpdateAssignee={updateTaskAssignee}
                            onUpdateDescription={updateTaskDescription}
                          />
                        ))}
                      </AnimatePresence>
                      
                      {columnTasks.length === 0 && (
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
            );
          })}
        </div>
      </DndContext>
    </>
  );
}