namespace backEnd.models {
    public class ScrapeResponse {
        public DomNode? Tree { get; set; }
        public int TotalNodes { get; set; }
        public int MaxDepth { get; set; }
    }
}