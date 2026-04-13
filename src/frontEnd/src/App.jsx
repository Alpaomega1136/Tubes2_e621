import { useState, useRef } from "react";
import InputForm from "./components/InputForm";
import TreeView from "./components/TreeView";
import ResultsPanel from "./components/ResultsPanel";
import { scrapeHtml, traverseDom } from "./services/api";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tree, setTree] = useState(null);
  const [maxDepth, setMaxDepth] = useState(0);
  const [totalNodes, setTotalNodes] = useState(0);
  const [traversalResult, setTraversalResult] = useState(null);

  const [isAnimationEnabled, setIsAnimationEnabled] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(400); // ms per step
  const [animatedPath, setAnimatedPath] = useState([]);
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const timerRef = useRef(null);

  const handleScrape = async (source) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setLoading(true);
    setError(null);
    setTraversalResult(null);
    setAnimatedPath([]);
    setCurrentNodeId(null);
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

  const handleTraverse = async (params) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setLoading(true);
    setError(null);
    setAnimatedPath([]);
    setCurrentNodeId(null);

    try {
      const data = await traverseDom(params);
      setTree(data.tree);
      setMaxDepth(data.maxDepth);
      setTraversalResult(data);

      const path = data.traversalPath;

      if (isAnimationEnabled) {
        let index = 0;
        timerRef.current = setInterval(() => {
          if (index < path.length) {
            const nextId = path[index];
            setCurrentNodeId(nextId);
            setAnimatedPath((prev) => [...prev, nextId]);
            index++;
          } else {
            setCurrentNodeId(null);
            clearInterval(timerRef.current);
          }
        }, animationSpeed);
      } else {
        setAnimatedPath(path);
        setCurrentNodeId(null);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-gray-200">
      <div className="fixed inset-0 z-[-1] bg-background bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]"></div>

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

      <main className="max-w-7xl mx-auto p-6 md:p-8 flex flex-col gap-8 animate-fade-in">

        {/*Pengaturan dan Input */}
        <motion.div className="space-y-6 max-w-4xl mx-auto w-full" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl flex items-start gap-3 animate-slide-up">
              <svg className="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1 text-sm font-medium">{error}</div>
              <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-red-200">
                ×
              </button>
            </div>
          )}
          <InputForm
            onScrape={handleScrape}
            onTraverse={handleTraverse}
            loading={loading}
            isAnimationEnabled={isAnimationEnabled}
            setIsAnimationEnabled={setIsAnimationEnabled}
            animationSpeed={animationSpeed}
            setAnimationSpeed={setAnimationSpeed}
          />
        </motion.div>

        {/* Visualisasi Pohon DOM */}
        <motion.div className="flex flex-col gap-4 w-full" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <TreeView
            tree={tree}
            maxDepth={maxDepth}
            totalNodes={totalNodes}
            matchedIds={traversalResult?.matchedNodeIds}
            traversalPath={animatedPath}
            currentNodeId={currentNodeId}
            loading={loading}
          />
        </motion.div>

        {/* Statistik dan Log Hasil Penelusuran */}
        <AnimatePresence>
          {traversalResult && (
            <motion.div className="w-full" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <ResultsPanel result={traversalResult} />
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}

export default App;