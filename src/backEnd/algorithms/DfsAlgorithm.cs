using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Threading.Tasks;
using backEnd.models;

namespace backEnd.algorithms
{
    public static class DfsAlgorithm
    {
        public static void ExecuteParallel(
            DomNode root,
            Action<DomNode> visitAction,
            int? maxResults,
            ConcurrentBag<DomNode> matches)
        {
            var stack = new ConcurrentStack<DomNode>();
            stack.Push(root);

            while (!stack.IsEmpty)
            {
                if (maxResults.HasValue && matches.Count >= maxResults.Value)
                    break;

                if (stack.TryPop(out var node))
                {
                    Parallel.Invoke(() =>
                    {
                        if (maxResults.HasValue && matches.Count >= maxResults.Value)
                            return;

                        visitAction(node);
                    });

                    if (node.Children != null)
                    {
                        for (int i = node.Children.Count - 1; i >= 0; i--)
                        {
                            stack.Push(node.Children[i]);
                        }
                    }
                }
            }
        }
    }
}