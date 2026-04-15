using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Threading.Tasks;
using backEnd.models;

namespace backEnd.algorithms
{
    public static class DfsAlgorithm
    {
        public static void ExecuteNormal(DomNode root, Action<DomNode> visitAction, int? maxResults, ConcurrentBag<DomNode> matches)
        {
            if (root == null) return;

            var stack = new Stack<DomNode>();
            stack.Push(root);

            while (stack.Count > 0)
            {
                if (maxResults.HasValue && matches.Count >= maxResults.Value)
                    break;

                var node = stack.Pop();

                visitAction(node);

                if (node.Children != null)
                {
                    for (int i = node.Children.Count - 1; i >= 0; i--)
                    {
                        stack.Push(node.Children[i]);
                    }
                }
            }
        }

        public static void ExecuteParallel(DomNode root, Action<DomNode> visitAction, int? maxResults, ConcurrentBag<DomNode> matches)
        {
            if (root == null) return;

            var stack = new ConcurrentStack<DomNode>();
            stack.Push(root);

            int workerCount = Environment.ProcessorCount;

            Parallel.For(0, workerCount, _ =>
            {
                while (!stack.IsEmpty)
                {
                    if (maxResults.HasValue && matches.Count >= maxResults.Value)
                        break;

                    if (stack.TryPop(out var node))
                    {
                        if (maxResults.HasValue && matches.Count >= maxResults.Value)
                            return;

                        visitAction(node);

                        if (node.Children != null)
                        {
                            for (int i = 0; i < node.Children.Count; i++)
                            {
                                stack.Push(node.Children[i]);
                            }
                        }
                    }
                }
            });
        }
    }
}