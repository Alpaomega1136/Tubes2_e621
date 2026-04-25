// BfsAlgorithm.cs
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backEnd.models;

namespace backEnd.algorithms {
    public static class BfsAlgorithm {

        public static void ExecuteNormal(DomNode root, Action<DomNode> visitAction, int? maxResults, ConcurrentBag<DomNode> matches) {
            if (root == null) return;

            var queue = new Queue<DomNode>();
            queue.Enqueue(root);

            while (queue.Count > 0) {
                if (maxResults.HasValue && matches.Count >= maxResults.Value) break;

                var node = queue.Dequeue();
                visitAction(node);

                if (node.Children != null)
                    foreach (var child in node.Children)
                        queue.Enqueue(child);
            }
        }

        public static void ExecuteParallel(DomNode root, Action<DomNode> visitAction, int? maxResults, ConcurrentBag<DomNode> matches) {
            if (root == null) return;

            var currentLevel = new List<DomNode> { root };

            while (currentLevel.Count > 0) {
                if (maxResults.HasValue && matches.Count >= maxResults.Value) break;

                var nextLevel = new ConcurrentBag<DomNode>();

                Parallel.ForEach(currentLevel, new ParallelOptions {
                    MaxDegreeOfParallelism = Environment.ProcessorCount
                },
                (node, state) => {
                    if (maxResults.HasValue && matches.Count >= maxResults.Value) {
                        state.Stop(); return;
                    }

                    visitAction(node);

                    if (node.Children != null)
                        foreach (var child in node.Children)
                            nextLevel.Add(child);
                });

                currentLevel = nextLevel.ToList();
            }
        }
    }
}