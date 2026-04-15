import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function InputForm({
  onScrape, onTraverse, loading, isAnimationEnabled, setIsAnimationEnabled, animationSpeed, setAnimationSpeed
}) {
  const [inputMode, setInputMode] = useState("url");
  const [url, setUrl] = useState("");
  const [html, setHtml] = useState("");
  const [algorithm, setAlgorithm] = useState("bfs");
  const [isParallel, setParallel] = useState(false);
  const [isFocus, setFocus] = useState(false);
  const [selector, setSelector] = useState("");
  const [resultMode, setResultMode] = useState("all");
  const [topN, setTopN] = useState(5);

  const getSource = () => (inputMode === "url" ? { url } : { html });

  const handleScrape = () => {
    if (loading || (inputMode === "url" && !url) || (inputMode === "html" && !html)) return;
    onScrape(getSource());
  };

  const handleTraverse = () => {
    if (loading || !selector.trim()) return;
    onTraverse({
      ...getSource(),
      selector,
      algorithm,
      isParallel,
      maxResults: resultMode === "topn" ? topN : null,
    });
  };

  const isExecuteReady = selector.trim().length > 0 && !loading;

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="relative flex flex-col gap-5 p-5 md:p-6 rounded-2xl bg-surface/20 backdrop-blur-md border border-white/10 shadow-2xl"
    >
      {/* --- Bagian 1: Sumber Data --- */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center">
        {/* Toggle Mode */}
        <div role="radiogroup" className="flex bg-background/90 rounded-lg p-1 border border-white/5 shrink-0 shadow-inner">
          {["url", "html"].map((mode) => (
            <button
              key={mode} type="button" role="radio" aria-checked={inputMode === mode} onClick={() => setInputMode(mode)}
              className={`relative px-4 py-2 text-xs font-bold uppercase z-10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calmBlue rounded-md flex items-center gap-2 ${
                inputMode === mode ? "text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {inputMode === mode && (
                <motion.div layoutId="srcModeBg" className="absolute inset-0 bg-calmBlue rounded-md -z-10 shadow-[0_0_12px_rgba(59,130,246,0.4)]" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />
              )}
              {mode}
            </button>
          ))}
        </div>

        {/* Input Teks dengan Ikon */}
        <div className="flex-1 relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-calmBlue transition-colors z-10 pointer-events-none">
          </div>
          <AnimatePresence mode="popLayout">
            {inputMode === "url" ? (
              <motion.input
                key="url" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                type="url" placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScrape()}
                className="w-full bg-background/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-calmBlue focus:bg-background/80 focus:ring-4 focus:ring-calmBlue/20 transition-all shadow-inner"
              />
            ) : (
              <motion.textarea
                key="html" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                rows={1} placeholder="<html lang='en'>...</html>" value={html} onChange={(e) => setHtml(e.target.value)}
                className="w-full bg-background/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-calmBlue focus:bg-background/80 focus:ring-4 focus:ring-calmBlue/20 font-mono resize-y transition-all shadow-inner"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Tombol Load */}
        <button
          type="button" onClick={handleScrape} disabled={loading || (inputMode === "url" ? !url : !html)}
          className="w-full md:w-auto shrink-0 flex items-center justify-center gap-2 bg-calmBlue/10 hover:bg-calmBlue/20 border border-calmBlue/30 px-6 py-2.5 rounded-xl text-calmBlue text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calmBlue"
        >
          {loading ? "LOADING..." : "LOAD DOM"}
        </button>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

      {/* --- Bagian 2: Konfigurasi & Eksekusi --- */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center">
        {/* Wrapper Algoritma & Parallel (Bisa scroll horizontal di layar sangat kecil) */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0 hide-scrollbar shrink-0">
          <div role="radiogroup" className="flex bg-background/90 rounded-lg p-1 border border-white/5 shrink-0 shadow-inner">
            {["bfs", "dfs"].map((alg) => (
              <button
                key={alg} type="button" role="radio" aria-checked={algorithm === alg} onClick={() => setAlgorithm(alg)}
                className={`relative px-4 py-2 text-xs font-bold uppercase z-10 transition-colors focus-visible:outline-none rounded-md ${
                  algorithm === alg ? "text-white" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {algorithm === alg && (
                  <motion.div layoutId="algModeBg" className="absolute inset-0 bg-purple-600 rounded-md -z-10 shadow-[0_0_12px_rgba(147,51,234,0.4)]" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />
                )}
                {alg}
              </button>
            ))}
          </div>

          <button
            type="button" role="switch" aria-checked={isParallel} onClick={() => setParallel(!isParallel)}
            className="flex items-center gap-2.5 shrink-0 bg-background/90 px-3 py-2 rounded-lg border border-white/5 hover:bg-white/5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 shadow-inner"
          >
            <div className={`relative w-8 h-4 rounded-full transition-colors duration-300 ${isParallel ? "bg-purple-500" : "bg-gray-700"}`}>
              <motion.div animate={{ x: isParallel ? 16 : 2 }} className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" transition={{ type: "spring", stiffness: 500, damping: 30 }} />
            </div>
            <span className={`text-xs font-bold uppercase select-none transition-colors ${isParallel ? "text-purple-300" : "text-gray-500"}`}>Parallel</span>
          </button>
        </div>

        {/* CSS Selector Input */}
        <div className="flex-1 relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-neonGreen transition-colors z-10 pointer-events-none">
          </div>
          <input
            type="text" placeholder="Target CSS (e.g. div > p.class)" value={selector} onChange={(e) => setSelector(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTraverse()}
            className="w-full bg-background/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neonGreen-light placeholder-gray-500 focus:outline-none focus:border-neonGreen focus:bg-background/80 focus:ring-4 focus:ring-neonGreen/20 font-mono transition-all shadow-inner"
          />
        </div>

        {/* Limit Hasil (Merged UI) */}
        <div className="flex shrink-0 items-center bg-background/50 border border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-gray-400 focus-within:border-gray-400 transition-all">
          <select
            aria-label="Result Limit" value={resultMode} onChange={(e) => setResultMode(e.target.value)}
            className="bg-transparent pl-3 pr-8 py-2.5 text-xs text-gray-300 focus:outline-none cursor-pointer appearance-none outline-none border-none"
            style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
          >
            <option value="all" className="bg-gray-800">All Results</option>
            <option value="topn" className="bg-gray-800">Top-N</option>
          </select>
          <AnimatePresence>
            {resultMode === "topn" && (
              <motion.input
                initial={{ width: 0, opacity: 0, paddingLeft: 0 }} animate={{ width: 60, opacity: 1, paddingLeft: 8 }} exit={{ width: 0, opacity: 0, paddingLeft: 0 }}
                type="number" min={1} value={topN} onChange={(e) => setTopN(parseInt(e.target.value) || 1)}
                className="bg-white/5 py-2.5 text-xs text-white focus:outline-none border-l border-white/10"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Tombol Eksekusi Primary */}
        <button
          type="button" onClick={handleTraverse} disabled={!isExecuteReady}
          className={`w-full md:w-auto shrink-0 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neonGreen/40 ${
            isExecuteReady 
              ? "bg-gradient-to-r from-neonGreen to-emerald-500 shadow-[0_0_15px_rgba(57,255,20,0.3)] hover:shadow-[0_0_25px_rgba(57,255,20,0.5)] hover:-translate-y-0.5" 
              : "bg-gray-700 text-gray-400 opacity-50 cursor-not-allowed"
          }`}
        >
          EXECUTE
        </button>
      </div>

      {/* --- Bagian 3: Visualizer Settings --- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
        <button
          type="button" role="switch" aria-checked={isAnimationEnabled} onClick={() => setIsAnimationEnabled(!isAnimationEnabled)}
          className="flex items-center gap-2.5 shrink-0 group focus-visible:outline-none"
        >
          <div className={`relative w-8 h-4 rounded-full transition-all duration-300 group-focus-visible:ring-2 group-focus-visible:ring-calmBlue group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-surface ${isAnimationEnabled ? "bg-calmBlue shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-gray-700"}`}>
            <motion.div animate={{ x: isAnimationEnabled ? 16 : 2 }} className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" transition={{ type: "spring", stiffness: 500, damping: 30 }} />
          </div>
          <span className={`text-xs font-bold select-none transition-colors ${isAnimationEnabled ? "text-calmBlue-light" : "text-gray-500"}`}>Visualizer Animation</span>
        </button>

        <AnimatePresence>
          {isAnimationEnabled && (
            <motion.div
              initial={{ opacity: 0, x: -10, filter: "blur(4px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} exit={{ opacity: 0, x: -10, filter: "blur(4px)" }}
              className="flex-1 flex items-center gap-3 w-full bg-background/30 p-2 rounded-lg border border-white/5"
            >
              <button
                type="button" role="switch" aria-checked={isFocus} onClick={() => setFocus(!isFocus)}
                className="flex items-center gap-2 shrink-0 bg-white/5 px-2.5 py-1 rounded-md hover:bg-white/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calmBlue"
              >
                <div className={`relative w-6 h-3 rounded-full transition-colors duration-300 ${isFocus ? "bg-calmBlue" : "bg-gray-600"}`}>
                  <motion.div animate={{ x: isFocus ? 12 : 2 }} className="absolute top-0.5 w-2 h-2 bg-white rounded-full shadow-sm" />
                </div>
                <span className={`text-[10px] font-bold uppercase select-none ${isFocus ? "text-calmBlue-light" : "text-gray-400"}`}>Focus</span>
              </button>

              <div className="flex-1 flex items-center gap-2">
                <span className="text-[10px] text-gray-500 font-bold uppercase shrink-0">Speed</span>
                <input
                  type="range" min="50" max="1500" step="50" value={animationSpeed} onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                  className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-calmBlue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calmBlue"
                />
                <span className="text-[10px] font-mono text-calmBlue-light bg-calmBlue/10 px-1.5 py-0.5 rounded border border-calmBlue/20 shrink-0 w-12 text-center">
                  {animationSpeed}ms
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* CSS internal khusus untuk menyembunyikan scrollbar di container horizontal */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </form>
  );
}