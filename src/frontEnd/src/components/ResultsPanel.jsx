import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Menampilkan statistik hasil penelusuran (kecocokan, kedalaman, dan waktu eksekusi) serta log
export default function ResultsPanel({ result }) {
  const [showLog, setShowLog] = useState(false);

  if (!result) return null;

  return (
    <div className="glass-panel rounded-2xl flex flex-col overflow-hidden animate-slide-up">
      {/* Header Statistik */}
      <div className="p-6 border-b border-borderDrop">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400 mb-5">
          Analysis Results
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Matches" value={result.matchedNodeIds?.length ?? 0} color="text-neonGreen-light" bg="bg-neonGreen/10" />
          <StatCard label="Nodes Visited" value={result.nodesVisited} color="text-calmBlue-light" bg="bg-calmBlue/10" />
          <StatCard label="Time" value={`${result.timeTakenMs.toFixed(2)}ms`} color="text-yellow-400" bg="bg-yellow-400/10" />
          <StatCard label="Depth" value={result.maxDepth} color="text-purple-400" bg="bg-purple-400/10" />
        </div>
      </div>

      {/* Log Jalur Penelusuran (Dapat di-expand) */}
      <div className="p-4 bg-surface/30">
        <button
          onClick={() => setShowLog(!showLog)}
          className="flex items-center justify-between w-full p-2 text-sm text-gray-400 hover:text-gray-200 transition-colors rounded-lg hover:bg-surface"
        >
          <span className="font-semibold tracking-wide">Traversal Log ({result.traversalLog?.length ?? 0} steps)</span>
          <motion.span 
            animate={{ rotate: showLog ? 180 : 0 }} 
            className="text-xs"
          >
            ▼
          </motion.span>
        </button>

        <AnimatePresence>
          {showLog && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 bg-background/80 border border-borderDrop rounded-xl p-4 max-h-[300px] overflow-auto shadow-inner text-xs font-mono text-gray-400 space-y-1.5 custom-scrollbar">
                {result.traversalLog?.map((line, i) => (
                  <div
                    key={i}
                    className={`leading-relaxed ${
                      line.includes("Match found")
                        ? "text-neonGreen-light bg-neonGreen/5 px-2 py-0.5 rounded"
                        : line.includes("Reached max")
                        ? "text-yellow-400"
                        : ""
                    }`}
                  >
                    <span className="opacity-40 mr-2">{(i + 1).toString().padStart(3, '0')}</span>
                    {line}
                  </div>
                ))}
            </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, bg }) {
  return (
    <div className={`rounded-xl px-4 py-3 border border-borderDrop/50 relative overflow-hidden group`}>
      <div className={`absolute inset-0 ${bg} opacity-50 group-hover:opacity-100 transition-opacity`}></div>
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</div>
        <div className={`text-xl font-black tracking-tight mt-1 ${color}`}>{value}</div>
      </div>
    </div>
  );
}
