"use client";

import { motion } from "framer-motion";
import Board from "./components/Board";
import { Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
      
      {/* Noise texture */}
      <div className="noise-texture" />

      {/* Glowing orbs - mesh gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[600px] h-[600px] bg-purple-600/20 blur-[120px] rounded-full top-[-200px] left-[-200px] animate-pulse" />
        <div className="absolute w-[500px] h-[500px] bg-pink-600/20 blur-[120px] rounded-full bottom-[-150px] right-[-150px] animate-pulse" />
        <div className="absolute w-[400px] h-[400px] bg-blue-500/15 blur-[120px] rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-float" />
        <div className="absolute w-[300px] h-[300px] bg-purple-500/10 blur-[100px] rounded-full top-1/3 right-1/4 animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        
        {/* Glassmorphism header container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 mb-16 shadow-2xl"
        >
          <div className="text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium mb-6 border border-purple-500/30 backdrop-blur-sm cursor-pointer"
            >
              <Sparkles size={14} />
              Real-time Collaboration
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse ml-1 shadow-[0_0_6px_2px_rgba(34,197,94,0.5)]" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-7xl font-bold mb-4 tracking-tight drop-shadow-[0_0_40px_rgba(168,85,247,0.4)]"
            >
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent bg-[length:200%] animate-gradient">
                Collaboration Board
              </span>
            </motion.h1>
            
            <div className="w-24 h-[2px] mx-auto bg-gradient-to-r from-transparent via-purple-500 to-transparent mt-6 mb-6" />
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-gray-400/80 max-w-xl mx-auto leading-relaxed tracking-wide"
            >
              Drag and drop tasks between columns — real-time sync
            </motion.p>
          </div>
        </motion.div>

        {/* Glassmorphism board container */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
          <Board />
        </div>
      </div>
    </div>
  );
}