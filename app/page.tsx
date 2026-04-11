import Board from "./components/Board";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Collaboration Board
          </h1>
          <p className="text-gray-400">Add tasks to any column</p>
        </div>
        <Board />
      </div>
    </div>
  );
}