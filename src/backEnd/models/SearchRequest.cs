namespace backEnd.models {
    public class SearchRequest {
        public string Url { get; set; }
        public string Html { get; set; }
        public string Selector { get; set; } = string.Empty;
        public string Algorithm { get; set; } = "bfs";
        public int? MaxResults { get; set; }
    }

    public class ScrapeRequest {
        public string Url { get; set; }
        public string Html { get; set; }
    }
}