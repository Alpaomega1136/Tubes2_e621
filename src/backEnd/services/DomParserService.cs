using backEnd.models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

namespace backEnd.services {
    public class DomParserService {
        private int nodeCounter_ = 0;

        private static readonly HashSet<string> VoidElements = new HashSet<string>(StringComparer.OrdinalIgnoreCase) {
            "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"
        };

        public DomNode ParseAndPrepareLCA(string html) {
            nodeCounter_ = 0;
            if (string.IsNullOrWhiteSpace(html)) return null;

            var stack = new Stack<DomNode>();
            DomNode root = null;
            int lastIndex = 0;

            string pattern = @"<\s*(/?)\s*([a-zA-Z0-9_-]+)([^>]*?)(/?)\s*>";
            var matches = Regex.Matches(html, pattern);

            foreach (Match match in matches) {
                string textBetween = html.Substring(lastIndex, match.Index - lastIndex).Trim();
                if (!string.IsNullOrEmpty(textBetween) && stack.Count > 0) {
                    var topNode = stack.Peek();
                    topNode.TextContent = string.IsNullOrEmpty(topNode.TextContent) 
                        ? textBetween 
                        : topNode.TextContent + " " + textBetween;
                }
                lastIndex = match.Index + match.Length;

                bool isClosingTag = match.Groups[1].Value == "/";
                string tagName = match.Groups[2].Value.ToLower();
                string attributesStr = match.Groups[3].Value;
                bool isSelfClosing = match.Groups[4].Value == "/" || VoidElements.Contains(tagName);

                if (tagName.StartsWith("!")) continue;

                if (isClosingTag) {
                    while (stack.Count > 0) {
                        var popped = stack.Pop();
                        if (string.Equals(popped.TagName, tagName, StringComparison.OrdinalIgnoreCase)) {
                            break; 
                        }
                    }
                    continue;
                }

                var parent = stack.Count > 0 ? stack.Peek() : null;
                int depth = parent != null ? parent.Depth + 1 : 0;

                var domNode = new DomNode {
                    Id = $"node-{++nodeCounter_}",
                    TagName = tagName,
                    Depth = depth
                };

                ParseAttributes(attributesStr, domNode);

                domNode.Up[0] = parent ?? domNode; 
                for (int i = 1; i < 20; i++) {
                    if (domNode.Up[i - 1] != null && domNode.Up[i - 1].Up != null && domNode.Up[i - 1].Up[i - 1] != null) {
                        domNode.Up[i] = domNode.Up[i - 1].Up[i - 1];
                    }
                }

                if (parent != null) {
                    parent.Children.Add(domNode);
                } else if (root == null) {
                    root = domNode;
                }

                if (!isSelfClosing) {
                    stack.Push(domNode);
                }
            }

            return root;
        }

        private void ParseAttributes(string attributesStr, DomNode node) {
            if (string.IsNullOrWhiteSpace(attributesStr)) return;

            var matches = Regex.Matches(attributesStr, @"([a-zA-Z0-9_-]+)\s*=\s*(?:'([^']*)'|""([^""]*)""|([^\s>]+))");

            foreach (Match m in matches) {
                string key = m.Groups[1].Value.ToLower();
                string val = m.Groups[2].Success ? m.Groups[2].Value : (m.Groups[3].Success ? m.Groups[3].Value : m.Groups[4].Value);

                if (key == "id") {
                    node.ElementId = val;
                } 
                else if (key == "class") {
                    node.Classes = val.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).ToList();
                }
            }
        }

        public DomNode GetLCA(DomNode u, DomNode v) {
            if (u.Depth < v.Depth) (u, v) = (v, u);

            for (int i = 19; i >= 0; i--) {
                if (u.Depth - (1 << i) >= v.Depth)
                    u = u.Up[i];
            }

            if (u == v) return u;

            for (int i = 19; i >= 0; i--) {
                if (u.Up[i] != v.Up[i]) {
                    u = u.Up[i];
                    v = v.Up[i];
                }
            }
            return u.Up[0];
        }
    }
}