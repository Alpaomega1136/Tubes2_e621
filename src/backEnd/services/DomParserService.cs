using backEnd.models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace backEnd.services {
    public class DomParserService {
        private int nodeCounter_ = 0;

        private static readonly HashSet<string> VoidElements = new HashSet<string>(StringComparer.OrdinalIgnoreCase) {
            "area", "base", "br", "col", "embed", "hr", "img", "input",
            "link", "meta", "param", "source", "track", "wbr"
        };

        public DomNode ParseAndPrepareLCA(string html) {
            nodeCounter_ = 0;
            if (string.IsNullOrWhiteSpace(html)) return null;

            var stack = new Stack<DomNode>();
            DomNode root = null;
            int pos = 0;

            while (pos < html.Length) {
                int nextOpen = html.IndexOf('<', pos);

                if (nextOpen == -1) {
                    AddTextNode(html.Substring(pos).Trim(), stack);
                    break;
                }

                if (nextOpen > pos) {
                    AddTextNode(html.Substring(pos, nextOpen - pos).Trim(), stack);
                }

                pos = nextOpen;

                if (pos + 4 <= html.Length && html.Substring(pos, 4) == "<!--") {
                    int commentEnd = html.IndexOf("-->", pos + 4);
                    pos = commentEnd != -1 ? commentEnd + 3 : html.Length;
                    continue;
                }

                if (pos + 2 <= html.Length && html.Substring(pos, 2) == "<!") {
                    int doctypeEnd = html.IndexOf('>', pos + 2);
                    pos = doctypeEnd != -1 ? doctypeEnd + 1 : html.Length;
                    continue;
                }

                bool isClosingTag = false;
                int tagStart = pos + 1;
                if (tagStart < html.Length && html[tagStart] == '/') {
                    isClosingTag = true;
                    tagStart++;
                }

                int tagEndIndex = html.IndexOf('>', tagStart);
                if (tagEndIndex == -1) break;

                string insideTag = html.Substring(tagStart, tagEndIndex - tagStart).Trim();
                pos = tagEndIndex + 1;

                if (string.IsNullOrWhiteSpace(insideTag)) continue;

                bool isSelfClosingExplicit = false;
                if (insideTag.EndsWith("/")) {
                    isSelfClosingExplicit = true;
                    insideTag = insideTag.Substring(0, insideTag.Length - 1).Trim();
                }

                string tagName;
                string attributesStr = "";

                int firstSpace = -1;
                for (int i = 0; i < insideTag.Length; i++) {
                    if (char.IsWhiteSpace(insideTag[i])) {
                        firstSpace = i;
                        break;
                    }
                }

                if (firstSpace == -1) {
                    tagName = insideTag;
                } else {
                    tagName = insideTag.Substring(0, firstSpace);
                    attributesStr = insideTag.Substring(firstSpace + 1);
                }

                tagName = tagName.ToLowerInvariant();
                bool isSelfClosing = isSelfClosingExplicit || VoidElements.Contains(tagName);

                if (isClosingTag) {
                    while (stack.Count > 0) {
                        var popped = stack.Pop();
                        if (string.Equals(popped.TagName, tagName, StringComparison.OrdinalIgnoreCase))
                            break;
                    }
                    continue;
                }

                var parent = stack.Count > 0 ? stack.Peek() : null;
                int depth = parent != null ? parent.Depth + 1 : 0;

                var domNode = new DomNode {
                    Id = $"node-{++nodeCounter_}",
                    TagName = tagName,
                    Depth = depth,
                    IsTextNode = false
                };

                ParseAttributesManual(attributesStr, domNode);

                domNode.Up[0] = parent ?? domNode;
                for (int i = 1; i < 20; i++) {
                    domNode.Up[i] = domNode.Up[i - 1].Up[i - 1];
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

        private void AddTextNode(string text, Stack<DomNode> stack) {
            if (string.IsNullOrEmpty(text) || stack.Count == 0) return;

            var parent = stack.Peek();

            var textNode = new DomNode {
                Id = $"node-{++nodeCounter_}",
                TagName = "#text",
                IsTextNode = true,
                TextContent = text,
                Depth = parent.Depth + 1
            };

            textNode.Up[0] = parent;
            for (int i = 1; i < 20; i++) {
                textNode.Up[i] = textNode.Up[i - 1].Up[i - 1];
            }

            parent.Children.Add(textNode);
        }

        private void ParseAttributesManual(string attrStr, DomNode node) {
            if (string.IsNullOrWhiteSpace(attrStr)) return;

            int pos = 0;
            while (pos < attrStr.Length) {
                while (pos < attrStr.Length && char.IsWhiteSpace(attrStr[pos])) pos++;
                if (pos >= attrStr.Length) break;

                int keyStart = pos;
                while (pos < attrStr.Length && attrStr[pos] != '=' && !char.IsWhiteSpace(attrStr[pos])) pos++;
                string key = attrStr.Substring(keyStart, pos - keyStart).ToLowerInvariant();

                if (string.IsNullOrEmpty(key)) { pos++; continue; }

                while (pos < attrStr.Length && char.IsWhiteSpace(attrStr[pos])) pos++;

                if (pos >= attrStr.Length || attrStr[pos] != '=') {
                    node.Attributes[key] = "";
                    continue;
                }
                pos++;

                while (pos < attrStr.Length && char.IsWhiteSpace(attrStr[pos])) pos++;
                if (pos >= attrStr.Length) break;

                string value = "";
                char quote = attrStr[pos];
                if (quote == '"' || quote == '\'') {
                    pos++;
                    int valStart = pos;
                    while (pos < attrStr.Length && attrStr[pos] != quote) pos++;
                    value = attrStr.Substring(valStart, pos - valStart);
                    if (pos < attrStr.Length) pos++;
                } else {
                    int valStart = pos;
                    while (pos < attrStr.Length && !char.IsWhiteSpace(attrStr[pos])) pos++;
                    value = attrStr.Substring(valStart, pos - valStart);
                }

                if (key == "id") {
                    node.ElementId = value;
                } else if (key == "class") {
                    node.Classes = value.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).ToList();
                }

                node.Attributes[key] = value;
            }
        }

        public DomNode GetLCA(DomNode u, DomNode v) {
            if (u == null || v == null) return null;

            if (u.IsTextNode) u = u.Up[0];
            if (v.IsTextNode) v = v.Up[0];

            if (u.Depth < v.Depth) (u, v) = (v, u);

            for (int i = 19; i >= 0; i--)
                if (u.Depth - (1 << i) >= v.Depth)
                    u = u.Up[i];

            if (u == v) return u;

            for (int i = 19; i >= 0; i--)
                if (u.Up[i] != v.Up[i]) {
                    u = u.Up[i];
                    v = v.Up[i];
                }

            return u.Up[0];
        }
    }
}