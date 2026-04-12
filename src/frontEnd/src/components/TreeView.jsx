import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Komponen rekursif untuk masing-class node tunggal di dalam pohon DOM
function TreeNode({ node, matchedIds, traversalPath, depth = 0 }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;

  const isMatched = matchedIds?.includes(node.id);
  // const isTraversed = traversalPath?.includes(node.id);

  const visitOrder = traversalPath?.indexOf(node.id);
  const isTraversed = visitOrder !== -1;

  return (
    <div className="select-none relative flex flex-col items-start font-mono text-sm group/node">
      {/* Garis konektor bersarang di dalam pohon */}
      {depth > 0 && (
        <div className="absolute left-0 top-0 bottom-0 w-px bg-borderDrop -ml-4 group-last/node:bottom-auto group-last/node:h-4"></div>
      )}
      {depth > 0 && (
        <div className="absolute left-0 top-4 w-4 h-px bg-borderDrop -ml-4"></div>
      )}

      {/* Konten Node */}
      <motion.div
        layout
        onClick={() => setExpanded(!expanded)}
        className={`relative flex items-center gap-2 py-1.5 px-3 rounded-lg border transition-all cursor-pointer z-10 w-full max-w-full ${
          isMatched
            ? "bg-neonGreen/10 border-neonGreen shadow-[0_0_12px_rgba(16,185,129,0.2)]"
            : isTraversed
            ? "bg-calmBlue/10 border-calmBlue/50"
            : "border-transparent hover:bg-surface/50"
        }`}
      >
        {/* Tombol buka/tutup (Caret) */}
        <span className="w-5 flex justify-center text-gray-500 transition-colors group-hover/node:text-gray-300">
          {hasChildren ? (
            <motion.span animate={{ rotate: expanded ? 90 : 0 }} className="inline-block text-xs">▶</motion.span>
          ) : (
            <span className="opacity-30">•</span>
          )}
        </span>

        {/* Tag Name */}
        <span className={`${isMatched ? "text-neonGreen-light font-bold" : "text-purple-400"}`}>
          &lt;{node.tagName}&gt;
        </span>

        {/* Element ID */}
        {node.elementId && (
          <span className="text-yellow-500 font-semibold truncate max-w-[100px]">
            #{node.elementId}
          </span>
        )}

        {/* Classes */}
        {node.classes?.length > 0 && (
          <span className="text-sky-400 truncate max-w-[150px] opacity-80">
            .{node.classes.join(".")}
          </span>
        )}

        {/* Text Snippet */}
        {node.textContent && !node.children?.length && (
          <span className="text-gray-500 text-xs truncate max-w-[200px] italic ml-2">
            "{node.textContent.substring(0, 50)}"
          </span>
        )}

        {/* Match Badge */}
        {isTraversed && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] px-1.5 py-0.5 rounded border border-calmBlue/30 bg-calmBlue/20 text-calmBlue font-bold shadow-sm">
              #{visitOrder + 1}
            </span>
            
            {isMatched && (
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }} 
                className="w-2 h-2 rounded-full bg-neonGreen shadow-[0_0_8px_rgba(16,185,129,1)]"
              />
            )}
          </div>
        )}
      </motion.div>

      {/* Container Anak/Children */}
      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="pl-8 relative overflow-hidden w-full flex flex-col gap-1 mt-1"
          >
            {/* Guide line for children */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-borderDrop/50"></div>
            
            {node.children.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                matchedIds={matchedIds}
                traversalPath={traversalPath}
                depth={depth + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Komponen utama untuk menampilkan seluruh struktur visualisasi Pohon DOM
export default function TreeView({ tree, maxDepth, totalNodes, matchedIds, traversalPath, loading }) {
  if (loading) {
    return (
      <div className="glass-panel rounded-2xl flex-1 flex flex-col items-center justify-center min-h-[400px] border border-borderDrop/50 text-gray-500 space-y-4">
         <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-borderDrop border-t-calmBlue animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-4 h-4 bg-calmBlue rounded-full animate-pulse"></div>
            </div>
         </div>
         <p className="font-medium tracking-wide">Processing Document Tree...</p>
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="glass-panel rounded-2xl flex-1 flex flex-col items-center justify-center min-h-[400px] p-8 border border-borderDrop/50 text-gray-500 text-center">
        <svg className="w-16 h-16 mb-4 text-gray-700/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6a2 2 0 012-2h2l2 2h6a2 2 0 012 2v1m-2 4H6m2 4h6m-6 4h6" />
        </svg>
        <p className="font-medium tracking-wide">Awaiting HTML Input</p>
        <p className="text-sm opacity-60 mt-1">Provide a URL or raw HTML to visualize the DOM.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl flex flex-col overflow-hidden max-h-[85vh]">
      {/* Header Pohon DOM */}
      <div className="px-6 py-4 border-b border-borderDrop flex flex-wrap items-center justify-between gap-4 bg-surface/30">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">
          Document Tree
        </h2>
        <div className="flex gap-4">
          <div className="bg-background/80 border border-borderDrop rounded-lg px-3 py-1 text-xs text-gray-400 flex items-center gap-1.5 backdrop-blur-sm">
            Depth: <strong className="text-gray-100 font-mono">{maxDepth}</strong>
          </div>
          {totalNodes != null && (
            <div className="bg-background/80 border border-borderDrop rounded-lg px-3 py-1 text-xs text-gray-400 flex items-center gap-1.5 backdrop-blur-sm">
              Nodes: <strong className="text-gray-100 font-mono">{totalNodes}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Legenda warna kecocokan */}
      {matchedIds && (
        <div className="px-6 py-2 border-b border-borderDrop/50 flex gap-6 text-xs bg-surface/10">
          <span className="flex items-center gap-2 font-medium">
            <span className="w-3 h-3 rounded-full bg-neonGreen shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-gray-300">Target Found ({matchedIds.length})</span>
          </span>
          <span className="flex items-center gap-2 font-medium">
            <span className="w-3 h-3 rounded-sm bg-calmBlue/40 border border-calmBlue" />
            <span className="text-gray-400">Node Traversed</span>
          </span>
        </div>
      )}

      {/* Konten Utama Pohon */}
      <div className="p-4 md:p-6 overflow-auto custom-scrollbar">
        <div className="bg-background/40 border border-borderDrop/50 rounded-xl p-4 min-w-max shadow-inner">
          <TreeNode
            node={tree}
            matchedIds={matchedIds}
            traversalPath={traversalPath}
          />
        </div>
      </div>
    </div>
  );
}
