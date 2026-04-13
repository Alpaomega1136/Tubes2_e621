using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Threading.Tasks;
using backEnd.models;

namespace backEnd.algorithms {
    public static class BfsAlgorithm {
        public static void ExecuteParallel(DomNode root, Action<DomNode> visitAction, int? maxResults, ConcurrentBag<DomNode> matches) {
            var queue = new ConcurrentQueue<DomNode>();
            queue.Enqueue(root);

            while (!queue.IsEmpty) {
                if (maxResults.HasValue && matches.Count >= maxResults.Value) break;

                int levelSize = queue.Count;
                var currentLevelNodes = new List<DomNode>(levelSize);

                for (int i = 0; i < levelSize; i++) {
                    if (queue.TryDequeue(out var node))
                        currentLevelNodes.Add(node);
                }
                Parallel.ForEach(currentLevelNodes, (node, state) => {
                    if (state.IsStopped) return;

                    if (maxResults.HasValue && matches.Count >= maxResults.Value) {
                        state.Stop();
                        return;
                    }

                    visitAction(node);

                    // Cek ulang setelah visitAction
                    if (maxResults.HasValue && matches.Count >= maxResults.Value)
                        state.Stop();

                    foreach (var child in node.Children)
                        queue.Enqueue(child);
                });
            }
        }
    }
}
