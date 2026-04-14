using HtmlAgilityPack;
using backEnd.models;
using System.Collections.Generic;
using System.Linq;

namespace backEnd.services {
    public class DomParserService {
        private int nodeCounter_ = 0;

        public DomNode ParseAndPrepareLCA(string html) {
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            var rootHtmlNode = doc.DocumentNode.Descendants("html").FirstOrDefault() ?? doc.DocumentNode;
            
            nodeCounter_ = 0;
            var root = ConvertToDomNode(rootHtmlNode, null, 0);
            
            return root;
        }

        private DomNode ConvertToDomNode(HtmlNode htmlNode, DomNode? parent, int depth) {
            var domNode = new DomNode
            {
                Id = $"node-{++nodeCounter_}",
                TagName = htmlNode.Name,
                ElementId = htmlNode.Id,
                Classes = htmlNode.GetClasses().ToList(),
                TextContent = htmlNode.InnerText.Trim(),
                Depth = depth
            };

            domNode.Up[0] = parent ?? domNode;
            for (int i = 1; i < 20; i++) {
                domNode.Up[i] = domNode.Up[i - 1].Up[i - 1];
            }

            foreach (var child in htmlNode.ChildNodes) {
                if (child.NodeType == HtmlNodeType.Element) {
                    domNode.Children.Add(ConvertToDomNode(child, domNode, depth + 1));
                }
            }

            return domNode;
        }

        public DomNode GetLCA(DomNode u, DomNode v) {
            if (u.Depth < v.Depth) (u, v) = (v, u);

            for (int i = 19; i >= 0; i--) {
                if (u.Depth - (1 << i) >= v.Depth)
                    u = u.Up[i];
            }

            if (u == v) return u;

            for (int i = 19; i >= 0; i--) {
                if (u.Up[i] != v.Up[i])
                {
                    u = u.Up[i];
                    v = v.Up[i];
                }
            }
            return u.Up[0];
        }
    }
}