import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function InputForm({ onScrape, onTraverse, loading, isAnimationEnabled, setIsAnimationEnabled, animationSpeed, setAnimationSpeed }) {
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
    <form className="glass-panel rounded-xl p-4 md:p-5 flex flex-col gap-4 shadow-sm border border-borderDrop/40 bg-surface/10">

      {/*Sumber HTML */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        {/* Toggle Mode */}
        <div className="flex bg-background/80 rounded-lg p-1 border border-borderDrop/50 shrink-0">
          {["url", "html"].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setInputMode(mode)}
              className={`relative px-4 py-1.5 text-xs font-bold uppercase z-10 transition-colors ${inputMode === mode ? "text-white" : "text-gray-400 hover:text-gray-300"}`}
            >
              {inputMode === mode && (
                <motion.div layoutId="srcModeBg" className="absolute inset-0 bg-calmBlue rounded-md -z-10 shadow-[0_0_8px_rgba(59,130,246,0.2)]" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />
              )}
              {mode}
            </button>
          ))}
        </div>

        {/* Input Teks */}
        <div className="flex-1 relative">
          <AnimatePresence mode="popLayout">
            {inputMode === "url" ? (
              <motion.input
                key="url"
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                type="url" placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-surface/50 border border-borderDrop rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-calmBlue focus:ring-1 focus:ring-calmBlue/50"
              />
            ) : (
              <motion.textarea
                key="html"
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                rows={2} placeholder="<html lang='en'>...</html>" value={html} onChange={(e) => setHtml(e.target.value)}
                className="w-full bg-surface/50 border border-borderDrop rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-calmBlue focus:ring-1 focus:ring-calmBlue/50 font-mono resize-y"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Tombol Load */}
        <button
          type="button"
          onClick={handleScrape}
          disabled={loading}
          className="shrink-0 bg-surface hover:bg-borderDrop border border-borderDrop px-5 py-2.5 md:py-2 rounded-lg text-calmBlue-light text-xs font-bold transition-colors disabled:opacity-50"
        >
          {loading ? "Menyiapkan..." : "LOAD DOM"}
        </button>
      </div>

      <div className="h-px bg-gradient-to-r from-borderDrop/50 via-borderDrop to-transparent opacity-50"></div>

      {/*Konfigurasi Pencarian */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">

        {/* Toggle Algoritma */}
        <div className="flex bg-background/80 rounded-lg p-1 border border-borderDrop/50 shrink-0">
          {["bfs", "dfs"].map((alg) => (
            <button
              key={alg}
              type="button"
              onClick={() => setAlgorithm(alg)}
              className={`relative px-4 py-1.5 text-xs font-bold uppercase z-10 transition-colors ${algorithm === alg ? "text-white" : "text-gray-400 hover:text-gray-300"}`}
            >
              {algorithm === alg && (
                <motion.div layoutId="algModeBg" className="absolute inset-0 bg-purple-600/80 rounded-md -z-10 shadow-[0_0_8px_rgba(147,51,234,0.3)]" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />
              )}
              {alg}
            </button>
          ))}
        </div>

        {/* CSS Selector Input */}
        <div className="flex-1">
          <input
            type="text" placeholder="Target CSS (misal: div > p.class)" value={selector} onChange={(e) => setSelector(e.target.value)}
            className="w-full bg-surface/50 border border-borderDrop rounded-lg px-3 py-2 text-sm text-neonGreen-light focus:outline-none focus:border-neonGreen focus:ring-1 focus:ring-neonGreen/50 font-mono"
          />
        </div>

        {/* Limit Hasil */}
        <div className="flex gap-2 shrink-0 items-center">
          <select
            value={resultMode} onChange={(e) => setResultMode(e.target.value)}
            className="bg-surface/50 border border-borderDrop rounded-lg px-2 py-2 text-xs text-gray-300 focus:outline-none focus:border-gray-500 cursor-pointer"
          >
            <option value="all">Semua Hasil</option>
            <option value="topn">Top-N</option>
          </select>
          <AnimatePresence>
            {resultMode === "topn" && (
              <motion.input
                initial={{ width: 0, opacity: 0 }} animate={{ width: 60, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                type="number" min={1} value={topN} onChange={(e) => setTopN(parseInt(e.target.value) || 1)}
                className="bg-surface/50 border border-borderDrop rounded-lg px-2 py-2 text-xs text-white focus:outline-none"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Tombol Eksekusi */}
        <button
          type="button"
          onClick={handleTraverse}
          disabled={loading || !selector.trim()}
          className="shrink-0 bg-gradient-to-r from-neonGreen to-neonGreen-dark hover:from-neonGreen-light text-white px-6 py-2.5 md:py-2 rounded-lg text-xs font-bold shadow-[0_0_12px_rgba(16,185,129,0.2)] transition-all disabled:opacity-50 active:scale-95"
        >
          EXECUTE
        </button>
      </div>

      {/* Visualizer Animation Toggles */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-1 bg-surface/20 p-2.5 rounded-lg border border-borderDrop/30">
        <div
          className="flex items-center gap-2.5 cursor-pointer shrink-0"
          onClick={() => setIsAnimationEnabled(!isAnimationEnabled)}
        >
          <div className={`relative w-8 h-4 rounded-full transition-colors duration-300 ${isAnimationEnabled ? 'bg-calmBlue' : 'bg-gray-600'}`}>
            <motion.div animate={{ x: isAnimationEnabled ? 16 : 2 }} className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" transition={{ type: "spring", stiffness: 500, damping: 30 }} />
          </div>
          <span className="text-xs font-bold text-gray-300 select-none">Animasi Traversal</span>
        </div>

        <AnimatePresence>
          {isAnimationEnabled && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex-1 flex items-center gap-3 w-full">
              <span className="text-[10px] text-gray-500 font-bold uppercase shrink-0 hidden sm:block">Kecepatan:</span>
              <input
                type="range" min="50" max="1500" step="50" value={animationSpeed} onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-calmBlue"
              />
              <span className="text-[10px] font-mono text-calmBlue-light bg-calmBlue/10 px-1.5 py-0.5 rounded border border-calmBlue/20 shrink-0">
                {animationSpeed}ms
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </form>
  );
}