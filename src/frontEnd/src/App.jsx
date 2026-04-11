import { useState } from "react";
import InputForm from "./components/InputForm";
import TreeView from "./components/TreeView";
import ResultsPanel from "./components/ResultsPanel";
import { scrapeHtml, traverseDom } from "./services/api";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

// Komponen utama aplikasi yang menyimpan state pohon DOM dan hasil pencarian
function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tree, setTree] = useState(null);
  const [maxDepth, setMaxDepth] = useState(0);
  const [totalNodes, setTotalNodes] = useState(0);
  const [traversalResult, setTraversalResult] = useState(null);

  // Memulai proses scraping (URL/HTML mentah) ke backend
  const handleScrape = async (source) => {
    setLoading(true);
    setError(null);
    setTraversalResult(null);
    try {
      const data = await scrapeHtml(source);
      setTree(data.tree);
      setMaxDepth(data.maxDepth);
      setTotalNodes(data.totalNodes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Memulai proses traversal DOM (BFS/DFS) ke backend
  const handleTraverse = async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await traverseDom(params);
      setTree(data.tree);
      setMaxDepth(data.maxDepth);
      setTraversalResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-gray-200">
      <div className="fixed inset-0 z-[-1] bg-background bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]"></div>

      {/* Header */}
      <header className="sticky top-0 z-10 glass-panel border-b border-borderDrop/50 px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-baseline gap-3">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-calmBlue-light to-calmBlue-dark">
            DOM Traversal
          </h1>
          <span className="text-gray-400 text-sm tracking-wide font-medium">
            BFS & DFS Explorer
          </span>
        </div>
      </header>

      {/* Grid container utama */}
      <main className="max-w-7xl mx-auto p-6 md:p-8 grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-8 animate-fade-in">
        
        {/* Kolom Kiri: Input Form dan Panel Hasil */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <InputForm
            onScrape={handleScrape}
            onTraverse={handleTraverse}
            loading={loading}
          />
          <AnimatePresence>
            {traversalResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <ResultsPanel result={traversalResult} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Kolom Kanan: Visualisasi Pohon */}
        <motion.div 
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-5 py-4 text-sm flex items-center shadow-lg"
              >
                <span className="mr-3 text-lg">⚠️</span>
                {error}
              </motion.div>
            )}
          </AnimatePresence>
          <TreeView
            tree={tree}
            maxDepth={maxDepth}
            totalNodes={totalNodes}
            matchedIds={traversalResult?.matchedNodeIds}
            traversalPath={traversalResult?.traversalPath}
            loading={loading}
          />
        </motion.div>
      </main>
    </div>
  );
}

export default App;
