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
        }, 80);
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

      <main className="max-w-7xl mx-auto p-6 md:p-8 grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-8 animate-fade-in">
        <motion.div className="space-y-6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <InputForm
            onScrape={handleScrape}
            onTraverse={handleTraverse}
            loading={loading}
            isAnimationEnabled={isAnimationEnabled}
            setIsAnimationEnabled={setIsAnimationEnabled}
          />
          <AnimatePresence>
            {traversalResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                <ResultsPanel result={traversalResult} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div className="flex flex-col gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
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
      </main>
    </div>
  );
}

export default App;