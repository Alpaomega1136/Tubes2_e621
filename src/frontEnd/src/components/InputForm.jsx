import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Komponen formulir untuk konfigurasi pencarian dan algoritma traversal
export default function InputForm({ onScrape, onTraverse, loading }) {
  const [inputMode, setInputMode] = useState("url");
  const [url, setUrl] = useState("");
  const [html, setHtml] = useState("");
  const [algorithm, setAlgorithm] = useState("bfs");
  const [selector, setSelector] = useState("");
  const [resultMode, setResultMode] = useState("all");
  const [topN, setTopN] = useState(5);

  const getSource = () => (inputMode === "url" ? { url } : { html });

  const handleScrape = (e) => {
    e.preventDefault();
    onScrape(getSource());
  };

  const handleTraverse = (e) => {
    e.preventDefault();
    onTraverse({
      ...getSource(),
      selector,
      algorithm,
      maxResults: resultMode === "topn" ? topN : null,
    });
  };

  return (
    <form className="glass-panel rounded-2xl p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">
          Search Config
        </h2>
      </div>

      {/* Pemilihan input URL atau HTML mentah */}
      <div className="relative flex p-1 bg-background/80 rounded-xl border border-borderDrop/50 backdrop-blur-sm">
        {["url", "html"].map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setInputMode(mode)}
            className={`relative flex-1 py-1.5 text-sm font-semibold capitalize z-10 transition-colors ${inputMode === mode ? "text-white" : "text-gray-400 hover:text-gray-300"
              }`}
          >
            {inputMode === mode && (
              <motion.div
                layoutId="inputModeBg"
                className="absolute inset-0 bg-calmBlue rounded-lg -z-10 shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            {mode === "url" ? "URL" : "Raw HTML"}
          </button>
        ))}
      </div>

      {/* Area i */}
      <div className="space-y-4 relative">
        <AnimatePresence mode="wait">
          {inputMode === "url" ? (
            <motion.div
              key="url"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative group">
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-surface/50 border border-borderDrop rounded-xl px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-calmBlue focus:ring-1 focus:ring-calmBlue/50 transition-all shadow-inner"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="html"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <textarea
                rows={5}
                placeholder="<html>...</html>"
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                className="w-full bg-surface/50 border border-borderDrop rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-calmBlue focus:ring-1 focus:ring-calmBlue/50 font-mono resize-y transition-all shadow-inner"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={handleScrape}
          disabled={loading}
          className="w-full relative overflow-hidden bg-surface hover:bg-borderDrop border border-borderDrop text-calmBlue-light font-semibold py-3 rounded-xl transition-all disabled:opacity-50 active:scale-[0.98] group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-calmBlue/0 via-calmBlue/10 to-calmBlue/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-calmBlue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Parsing DOM...
            </span>
          ) : "Load & Parse HTML"}
        </button>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-borderDrop to-transparent"></div>

      {/* Pilihan Strategi Algoritma (BFS/DFS) */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Strategy</label>
        <div className="grid grid-cols-2 gap-3">
          {["bfs", "dfs"].map((alg) => (
            <label
              key={alg}
              className={`relative flex flex-col items-center p-3 cursor-pointer rounded-xl border transition-all ${algorithm === alg
                ? "bg-calmBlue/10 border-calmBlue text-calmBlue-light shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                : "bg-surface/30 border-borderDrop text-gray-400 hover:border-gray-500 hover:bg-surface/50"
                }`}
            >
              <input
                type="radio"
                name="algorithm"
                value={alg}
                checked={algorithm === alg}
                onChange={() => setAlgorithm(alg)}
                className="hidden"
              />
              <span className="font-bold text-lg uppercase">{alg}</span>
              <span className="text-[10px] tracking-wide opacity-70">
                {alg === 'bfs' ? 'Breadth-First' : 'Depth-First'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Input CSS Selector */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Target Selector</label>
        <input
          type="text"
          placeholder="e.g., div > p.class"
          value={selector}
          onChange={(e) => setSelector(e.target.value)}
          className="w-full bg-surface/50 border border-borderDrop rounded-xl px-4 py-3 text-neonGreen-light placeholder-gray-600 focus:outline-none focus:border-neonGreen focus:ring-1 focus:ring-neonGreen/50 font-mono transition-all shadow-inner"
        />
      </div>

      {/* Batas Hasil Pencarian */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Limit</label>
        <div className="flex gap-2 p-1 bg-background/80 rounded-xl border border-borderDrop/50 mb-3">
          {["all", "topn"].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setResultMode(mode)}
              className={`relative flex-1 py-1 text-xs font-semibold uppercase z-10 transition-colors ${resultMode === mode ? "text-white" : "text-gray-400 hover:text-gray-300"
                }`}
            >
              {resultMode === mode && (
                <motion.div
                  layoutId="limitModeBg"
                  className="absolute inset-0 bg-gray-700 rounded-lg -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {mode === "all" ? "All Matches" : "Top N"}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {resultMode === "topn" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <input
                type="number"
                min={1}
                value={topN}
                onChange={(e) => setTopN(parseInt(e.target.value) || 1)}
                className="w-full bg-surface/50 border border-borderDrop rounded-xl px-4 py-2 text-gray-200 focus:outline-none focus:border-gray-500 text-sm"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tombol Penelusuran*/}
      <button
        type="button"
        onClick={handleTraverse}
        disabled={loading || !selector.trim()}
        className={`
          w-full py-3.5 rounded-xl relative overflow-hidden
          bg-gradient-to-r from-neonGreen to-neonGreen-dark hover:from-neonGreen-light hover:to-neonGreen
          text-white font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all
          disabled:opacity-50 disabled:grayscale active:scale-[0.98]
        `}
      >
        {loading ? "Searching..." : "EXECUTE SEARCH"}
      </button>
    </form>
  );
}
