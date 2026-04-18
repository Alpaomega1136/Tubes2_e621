import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

function TreeNode({ node, matchedIds, traversalPath, currentNodeId, depth = 0, isFocus, expandAll }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;

  const isActuallyMatched = matchedIds?.includes(node.id);
  const visitOrder = traversalPath?.indexOf(node.id);
  const isTraversed = visitOrder !== -1;
  const isVisiting = node.id === currentNodeId;
  const isMatched = isActuallyMatched && isTraversed;
  const nodeRef = useRef(null);

  useEffect(() => {
    if (isVisiting) {
      setExpanded(true);
      if (nodeRef.current) {
        // Animasi auto-scroll khusus area diagram saja (tidak seluruh page Window)
        if (isFocus) {
          const container = document.getElementById("tree-scroll-container");
          if (container && nodeRef.current) {
            const nodeRect = nodeRef.current.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            container.scrollBy({
              top: nodeRect.top - containerRect.top - (containerRect.height / 2) + (nodeRect.height / 2),
              left: nodeRect.left - containerRect.left - (containerRect.width / 2) + (nodeRect.width / 2),
              behavior: "smooth"
            });
          }
        }
      }
    }
  }, [isVisiting, isFocus]);

  useEffect(() => {
    if (traversalPath?.length === 0) {
      setExpanded(depth < 2);
    }
  }, [traversalPath?.length, depth]);

  useEffect(() => {
    if (expandAll) {
      setExpanded(true);
    }
  }, [expandAll]);

  return (
    <div className="flex flex-row items-center relative group/node">
      {/* Tombol Miniatur Kotak Node */}
      <motion.div
        ref={nodeRef}
        layout
        onClick={() => setExpanded(!expanded)}
        className={`relative flex items-center gap-1.5 py-1 px-2.5 rounded-md border text-[11px] outline-none transition-all duration-300 cursor-pointer z-10 shadow-sm whitespace-nowrap min-w-max shrink-0 ${
          isVisiting
            ? "bg-yellow-400/20 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)] scale-110 z-20" 
            : isMatched
            ? "bg-neonGreen/20 border-neonGreen shadow-[0_0_10px_rgba(16,185,129,0.3)] z-10"
            : isTraversed
            ? "bg-calmBlue/20 border-calmBlue/50"
            : "bg-surface/80 border-borderDrop/70 hover:bg-surface hover:border-gray-500"
        }`}
      >
        <span className={`${isVisiting ? "text-yellow-400 font-bold" : isMatched ? "text-neonGreen-light font-bold" : "text-purple-400"}`}>
          &lt;{node.tagName}&gt;
        </span>

        {node.elementId && <span className="text-yellow-500 font-bold max-w-[80px] truncate">#{node.elementId}</span>}
        {node.classes?.length > 0 && <span className="text-sky-400 opacity-90 max-w-[100px] truncate">.{node.classes.join(".")}</span>}

        <div className="ml-1 flex items-center gap-1.5">
          {isTraversed && (
            <span className={`text-[9px] px-1 py-[1px] rounded border font-bold ${
              isVisiting ? "bg-yellow-400 text-black border-yellow-500" : "bg-calmBlue/20 text-calmBlue border-calmBlue/30"
            }`}>
              #{visitOrder + 1}
            </span>
          )}
          {isMatched && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-1.5 h-1.5 rounded-full bg-neonGreen shadow-[0_0_8px_rgba(16,185,129,1)]" />
          )}
          {hasChildren && (
            <span className="text-gray-500 text-[9px] ml-0.5 opacity-60">
              {expanded ? "[-]" : "[+]"}
            </span>
          )}
        </div>
      </motion.div>

      {/* Ranting Anak (Children Branches) */}
      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="flex flex-col py-1 pl-8 relative shrink-0"
          >
            {/* Garis Horizontal Penghubung Utama dari Parent ke Garis Vertikal */}
            <div className="absolute left-0 top-1/2 w-4 h-[2px] bg-sky-400/80 -translate-y-1/2" />

            {node.children.map((child, idx) => (
              <div key={child.id} className="relative flex items-center py-1 shrink-0">
                {/* Garis Horizontal Menuju Kotak Anak */}
                <div className="absolute -left-4 w-4 h-[2px] bg-sky-400/80" />
                
                {/* Logika Garis Vertikal (Trunk) yang menyambung antar anak */}
                {node.children.length > 1 && (
                  <>
                    {/* Anak Pertama: Garis vertikal ke bawah */}
                    {idx === 0 && <div className="absolute -left-4 top-1/2 bottom-0 w-[2px] bg-sky-400/80" />}
                    {/* Anak Terakhir: Garis vertikal ke atas */}
                    {idx === node.children.length - 1 && <div className="absolute -left-4 top-0 bottom-1/2 w-[2px] bg-sky-400/80" />}
                    {/* Anak di Tengah: Garis vertikal menembus atas ke bawah */}
                    {idx > 0 && idx < node.children.length - 1 && <div className="absolute -left-4 top-0 bottom-0 w-[2px] bg-sky-400/80" />}
                  </>
                )}

                <TreeNode
                  node={child}
                  matchedIds={matchedIds}
                  traversalPath={traversalPath}
                  currentNodeId={currentNodeId}
                  depth={depth + 1}
                  isFocus={isFocus}
                  expandAll={expandAll}
                />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TreeView({tree, maxDepth, totalNodes, matchedIds, traversalPath, currentNodeId, loading, isFocus, expandAll}) {
  const [zoom, setZoom] = useState(1);
  const handleZoomIn = () => setZoom(prev => Math.min(1.5, prev + 0.1));
  const handleZoomOut = () => setZoom(prev => Math.max(0.3, prev - 0.1));
  const resetZoom = () => setZoom(1);

  if (loading) return <div className="glass-panel rounded-2xl flex-1 flex flex-col items-center justify-center min-h-[400px] border border-borderDrop/50 text-gray-500 space-y-4">Membangun Diagram Pohon...</div>;
  if (!tree) return <div className="glass-panel rounded-2xl flex-1 flex flex-col items-center justify-center min-h-[400px] p-8 border border-borderDrop/50 text-gray-500 text-center">Data Pohon Belum Dimuat</div>;

  return (
    <div className="glass-panel rounded-2xl flex flex-col overflow-hidden max-h-[85vh]">
      <div className="px-6 py-4 border-b border-borderDrop flex flex-wrap items-center justify-between gap-4 bg-surface/30 shrink-0">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">Diagram Alur (Horizontal)</h2>
        <div className="flex gap-4">
          {/* Zoom Controls */}
          <div className="flex bg-background/80 border border-borderDrop rounded-lg items-center backdrop-blur-sm overflow-hidden text-xs shrink-0 shadow-sm">
            <button onClick={handleZoomOut} disabled={zoom <= 0.301} className="px-3 py-1 font-bold text-gray-400 hover:text-white hover:bg-surface disabled:opacity-30 transition-colors" title="Zoom Out">−</button>
            <span className="px-1 py-1 text-gray-100 font-mono border-x border-borderDrop/50 w-12 text-center" title="Zoom Level">{Math.round(zoom * 100)}%</span>
            <button onClick={handleZoomIn} disabled={zoom >= 1.499} className="px-3 py-1 font-bold text-gray-400 hover:text-white hover:bg-surface disabled:opacity-30 transition-colors" title="Zoom In">+</button>
            <button onClick={resetZoom} className="px-3 py-1 text-calmBlue hover:text-calmBlue-light hover:bg-surface border-l border-borderDrop/50 transition-colors font-semibold" title="Reset Zoom">Reset</button>
          </div>

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

      <div className="px-6 py-3 border-b border-borderDrop/50 flex flex-wrap gap-4 text-[11px] bg-surface/10 shrink-0 uppercase tracking-widest">
        <span className="flex items-center gap-2 font-bold">
          <span className="w-3 h-3 rounded-full bg-neonGreen shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-gray-300">Target Found ({matchedIds?.length || 0})</span>
        </span>
        <span className="flex items-center gap-2 font-bold">
          <span className="w-3 h-3 rounded bg-calmBlue/40 border border-calmBlue" />
          <span className="text-gray-400">Traversed</span>
        </span>
        <span className="flex items-center gap-2 font-bold">
          <span className="w-3 h-3 rounded bg-yellow-400/50 border border-yellow-400" />
          <span className="text-gray-300">Currently Visiting</span>
        </span>
      </div>

      {/* Area Viewport Utama dengan Scrollbar 2 Arah (Pan/Tilt) */}
      <div 
        id="tree-scroll-container"
        className="p-6 md:p-8 overflow-auto custom-scrollbar flex-1 relative bg-background/20 overflow-x-auto overflow-y-auto"
      >
        <div 
          className="min-w-fit min-h-fit origin-top-left transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
        >
          <TreeNode
            node={tree}
            matchedIds={matchedIds}
            traversalPath={traversalPath}
            currentNodeId={currentNodeId}
            isFocus={isFocus}
            expandAll={expandAll}
          />
        </div>
      </div>
    </div>
  );
}