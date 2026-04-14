namespace backEnd.models {
    public class SearchResponse {
        public DomNode? Tree { get; set; }
        public List<string> MatchedNodeIds { get; set; } = new();
        public List<string> TraversalPath { get; set; } = new();
        public List<string> TraversalLog { get; set; } = new();
        public int NodesVisited { get; set; }
        public double TimeTakenMs { get; set; }
        public int MaxDepth { get; set; }
    }
}