import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

function TreeNode({ node, matchedIds, traversalPath, currentNodeId, viewMode, depth = 0 }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;

  const isMatched = matchedIds?.includes(node.id);
  const visitOrder = traversalPath?.indexOf(node.id);
  const isTraversed = visitOrder !== -1;
  const isVisiting = node.id === currentNodeId;
  const nodeRef = useRef(null);

  useEffect(() => {
    if (isVisiting) {
      setExpanded(true);
    }
  }, [isVisiting]);

  return (
    <div className="flex flex-row items-center relative group/node">
      {/* Tombol Miniatur Kotak Node */}
      <motion.div
        id={`tree-node-${node.id}`}
        layout
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(!expanded);
        }}
        className={`treenode-badge relative flex items-center gap-1.5 py-1 px-2.5 rounded-md border text-[11px] outline-none transition-all duration-300 cursor-pointer z-10 shadow-sm whitespace-nowrap min-w-max shrink-0 ${
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
            <div className="absolute left-0 top-1/2 w-4 h-px bg-borderDrop/70 -translate-y-1/2" />

            {node.children.map((child, idx) => (
              <div key={child.id} className="relative flex items-center py-1 shrink-0">
                {/* Garis Horizontal Menuju Kotak Anak */}
                <div className="absolute -left-4 w-4 h-px bg-borderDrop/70" />
                {node.children.length > 1 && (
                  <>
                    {idx === 0 && <div className="absolute -left-4 top-1/2 bottom-0 w-px bg-borderDrop/70" />}
                    {idx === node.children.length - 1 && <div className="absolute -left-4 top-0 bottom-1/2 w-px bg-borderDrop/70" />}
                    {idx > 0 && idx < node.children.length - 1 && <div className="absolute -left-4 top-0 bottom-0 w-px bg-borderDrop/70" />}
                  </>
                )}

                <TreeNode
                  node={child}
                  matchedIds={matchedIds}
                  traversalPath={traversalPath}
                  currentNodeId={currentNodeId}
                  viewMode={viewMode}
                  depth={depth + 1}
                />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TreeView({ tree, maxDepth, totalNodes, matchedIds, traversalPath, currentNodeId, loading }) {
  const [viewMode, setViewMode] = useState("focus"); // 'focus' atau 'free'
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const containerRef = useRef(null);

  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startScroll = useRef({ left: 0, top: 0 });

  // Efek ganti mode
  useEffect(() => {
    if (viewMode === "focus") {
      setZoomLevel(1.0); // zoom default 100% saat mode fokus
    }
  }, [viewMode]);

  // Efek Auto-Scroll Lokal
  useEffect(() => {
    if (viewMode === "focus" && currentNodeId && containerRef.current) {
      const nodeEl = document.getElementById(`tree-node-${currentNodeId}`);
      const container = containerRef.current;
      
      if (nodeEl && container) {
        const containerRect = container.getBoundingClientRect();
        const nodeRect = nodeEl.getBoundingClientRect();

        const relTop = nodeRect.top - containerRect.top + container.scrollTop;
        const relLeft = nodeRect.left - containerRect.left + container.scrollLeft;

        container.scrollTo({
          top: relTop - containerRect.height / 2 + nodeRect.height / 2,
          left: relLeft - containerRect.width / 2 + nodeRect.width / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [currentNodeId, viewMode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const zoomSensitivity = 0.001;
      setZoomLevel(prev => {
        let newZoom = prev - e.deltaY * zoomSensitivity;
        return Math.max(0.1, Math.min(newZoom, 4.0));
      });
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [viewMode]);

  const handleMouseDown = (e) => {
    if (e.target.closest('.treenode-badge')) return;
    
    isDragging.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    if (containerRef.current) {
      startScroll.current = { left: containerRef.current.scrollLeft, top: containerRef.current.scrollTop };
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !containerRef.current) return;
    e.preventDefault();
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    containerRef.current.scrollLeft = startScroll.current.left - dx;
    containerRef.current.scrollTop = startScroll.current.top - dy;
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 3.0));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.2));
  const handleZoomReset = () => setZoomLevel(1.0);

  if (loading) return <div className="glass-panel rounded-2xl flex-1 flex flex-col items-center justify-center min-h-[400px] border border-borderDrop/50 text-gray-500 space-y-4">Membangun Diagram Pohon...</div>;
  if (!tree) return <div className="glass-panel rounded-2xl flex-1 flex flex-col items-center justify-center min-h-[400px] p-8 border border-borderDrop/50 text-gray-500 text-center">Data Pohon Belum Dimuat</div>;

  return (
    <div className="glass-panel rounded-2xl flex flex-col overflow-hidden max-h-[85vh]">
      <div className="px-6 py-4 border-b border-borderDrop flex flex-wrap items-center justify-between gap-4 bg-surface/30 shrink-0">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">Diagram Pohon DOM</h2>
          <div className="flex gap-2">
            <div className="bg-background/80 border border-borderDrop rounded px-2 py-0.5 text-[10px] text-gray-400 flex items-center gap-1.5 backdrop-blur-sm">
              Depth: <strong className="text-gray-100 font-mono">{maxDepth}</strong>
            </div>
            {totalNodes != null && (
              <div className="bg-background/80 border border-borderDrop rounded px-2 py-0.5 text-[10px] text-gray-400 flex items-center gap-1.5 backdrop-blur-sm">
                Nodes: <strong className="text-gray-100 font-mono">{totalNodes}</strong>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Toggle Mode */}
          <div className="flex bg-background/80 rounded-lg p-1 border border-borderDrop/50">
            <button
              onClick={() => setViewMode("focus")}
              className={`relative px-4 py-1.5 text-[10px] font-bold uppercase transition-colors rounded-md ${viewMode === "focus" ? "text-white bg-calmBlue shadow-md" : "text-gray-400 hover:text-gray-200"}`}
            >
              Mode Fokus
            </button>
            <button
              onClick={() => setViewMode("free")}
              className={`relative px-4 py-1.5 text-[10px] font-bold uppercase transition-colors rounded-md ${viewMode === "free" ? "text-white bg-purple-600 shadow-md" : "text-gray-400 hover:text-gray-200"}`}
            >
              Mode Bebas
            </button>
          </div>

          {/* Kontrol Zoom (Hanya aktif/berguna di mode bebas, tapi dimunculkan terus saja) */}
          <div className="flex items-center bg-background/80 border border-borderDrop/50 rounded-lg p-1 gap-1">
            <button onClick={handleZoomOut} className="px-2 py-1 bg-surface hover:bg-borderDrop rounded text-xs text-gray-300 transition-colors">-</button>
            <button onClick={handleZoomReset} className="px-2 py-1 text-[10px] font-mono font-bold text-calmBlue-light w-12 text-center hover:bg-surface rounded transition-colors" title="Reset Zoom">
              {Math.round(zoomLevel * 100)}%
            </button>
            <button onClick={handleZoomIn} className="px-2 py-1 bg-surface hover:bg-borderDrop rounded text-xs text-gray-300 transition-colors">+</button>
          </div>
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

      {/* Area Viewport Utama sebagai Kanvas Murni */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className="p-6 md:p-8 overflow-auto flex-1 relative bg-background/20 select-none cursor-grab active:cursor-grabbing [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
      >
        <div 
           className="min-w-fit min-h-fit origin-top-left transition-transform duration-200"
           style={{ transform: `scale(${zoomLevel})` }}
        >
          <TreeNode
            node={tree}
            matchedIds={matchedIds}
            traversalPath={traversalPath}
            currentNodeId={currentNodeId}
            viewMode={viewMode}
          />
        </div>
      </div>
    </div>
  );
}