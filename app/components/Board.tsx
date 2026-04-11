"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Plus, GripVertical, Trash2 } from "lucide-react";

const supabase = createClient(
  "https://nfoerfezojunroqggysf.supabase.co",
  "sb_publishable_4nRrXieWO_xGcr8jHzlmRQ_nI1uFXA7"
);

const columns = [
  { id: "todo", title: "📋 To Do", color: "bg-gray-500" },
  { id: "progress", title: "🔄 In Progress", color: "bg-blue-500" },
  { id: "done", title: "✅ Done", color: "bg-green-500" },
];

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

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading...</div>;
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {columns.map((column) => (
        <div key={column.id} className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${column.color}`} />
              <h2 className="text-white font-semibold">{column.title}</h2>
              <span className="text-gray-400 text-sm">
                {tasks.filter(t => t.status === column.id).length}
              </span>
            </div>
            <button
              onClick={() => setAddingTo(column.id)}
              className="p-1 hover:bg-gray-700 rounded-lg transition"
            >
              <Plus size={18} className="text-gray-400" />
            </button>
          </div>

          {/* Add Task Input */}
          {addingTo === column.id && (
            <div className="mb-4">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Task title..."
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") addTask(column.id);
                  if (e.key === "Escape") setAddingTo(null);
                }}
              />
            </div>
          )}

          {/* Tasks List */}
          <div className="space-y-2">
            {tasks
              .filter(t => t.status === column.id)
              .map((task) => (
                <div key={task.id} className="bg-gray-900 rounded-lg p-3 border border-gray-700 group">
                  <div className="flex items-center justify-between">
                    <p className="text-white text-sm">{task.title}</p>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-500/20 rounded"
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            
            {tasks.filter(t => t.status === column.id).length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">No tasks</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}