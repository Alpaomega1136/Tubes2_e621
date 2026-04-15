using System;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using backEnd.models;
using backEnd.algorithms;

namespace backEnd.services
{
    public class TraversalService
    {
        public SearchResponse Traverse(DomNode root, string selector, string algorithm, bool isParallel, int? maxResults)
        {
            var response = new SearchResponse { Tree = root };
            var stopwatch = Stopwatch.StartNew();

            var matchedNodes = new ConcurrentBag<DomNode>();
            var traversalPath = new ConcurrentQueue<string>();
            var traversalLog = new ConcurrentQueue<string>();

            int nodesVisited = 0;
            int maxDepth = 0;

            void LogVisit(DomNode node)
            {
                Interlocked.Increment(ref nodesVisited);

                int currentMax;
                do
                {
                    currentMax = maxDepth;
                } while (node.Depth > currentMax && Interlocked.CompareExchange(ref maxDepth, node.Depth, currentMax) != currentMax);

                traversalPath.Enqueue(node.Id);
                traversalLog.Enqueue($"[THREAD {Environment.CurrentManagedThreadId}] Mengunjungi <{node.TagName}> (ID: {node.Id})");

                if (SelectorMatcher.Matches(node, selector))
                {
                    matchedNodes.Add(node);
                    traversalLog.Enqueue($"[MATCH] Menemukan <{node.TagName}> cocok dengan '{selector}'");
                }
            }

            if (algorithm.Equals("bfs", StringComparison.OrdinalIgnoreCase))
            {
                if (isParallel)
                {
                    BfsAlgorithm.ExecuteParallel(root, LogVisit, maxResults, matchedNodes);
                }
                else
                {
                    // BfsAlgorithm.ExecuteNormal(root, LogVisit, maxResults, matchedNodes);
                }
            }
            else
            {
                if (isParallel)
                {
                    DfsAlgorithm.ExecuteParallel(root, LogVisit, maxResults, matchedNodes);
                }
                else
                {
                    DfsAlgorithm.ExecuteNormal(root, LogVisit, maxResults, matchedNodes);
                }
            }

            stopwatch.Stop();

            response.MatchedNodeIds = matchedNodes.Select(n => n.Id).ToList();
            response.TraversalPath = traversalPath.ToList();
            response.TraversalLog = traversalLog.ToList();
            response.NodesVisited = nodesVisited;
            response.TimeTakenMs = stopwatch.Elapsed.TotalMilliseconds;
            response.MaxDepth = maxDepth;

            return response;
        }
    }
}