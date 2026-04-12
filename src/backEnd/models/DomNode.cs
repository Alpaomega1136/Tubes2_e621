using System;
using System.Collections.Generic;

namespace backEnd.models {
    public class DomNode {
        public string Id { get; set; }
        public string TagName { get; set; }
        public string ElementId { get; set; }
        public List<string> Classes { get; set; } = new();
        public string TextContent { get; set; }
        public List<DomNode> Children { get; set; } = new();
        public int Depth { get; set; }
        
        [System.Text.Json.Serialization.JsonIgnore]
        public DomNode[] Up { get; set; } 

        public DomNode() {
            Up = new DomNode[20]; 
        }
    }
}