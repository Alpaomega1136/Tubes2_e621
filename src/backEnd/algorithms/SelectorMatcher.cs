using backEnd.models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace backEnd.algorithms {
    public static class SelectorMatcher {

        public static bool Matches(DomNode node, string selector) {
            if (node.IsTextNode) return false;
            if (string.IsNullOrWhiteSpace(selector)) return false;

            selector = selector.Trim();

            bool hasCombinator = false;
            foreach (char c in selector) {
                if (char.IsWhiteSpace(c) || c == '>' || c == '+' || c == '~') {
                    hasCombinator = true;
                    break;
                }
            }

            return hasCombinator ? EvaluateCombinator(node, selector) : MatchesSingle(node, selector);
        }

        public static bool MatchesSingle(DomNode node, string selector) {
            if (node.IsTextNode) return false;
            if (selector == "*") return true;

            string? tag = null;
            string? id = null;
            List<string> classes = new List<string>();
            List<(string key, string? value)> attrSelectors = new List<(string, string?)>();

            int pos = 0;
            while (pos < selector.Length) {
                char c = selector[pos];

                if (c == '#') {
                    pos++;
                    int start = pos;
                    while (pos < selector.Length && selector[pos] != '.' && 
                           selector[pos] != '#' && selector[pos] != '[' && 
                           selector[pos] != ':') pos++;
                    id = selector.Substring(start, pos - start);

                } else if (c == '.') {
                    pos++;
                    int start = pos;
                    while (pos < selector.Length && selector[pos] != '.' && 
                           selector[pos] != '#' && selector[pos] != '[' && 
                           selector[pos] != ':') pos++;
                    classes.Add(selector.Substring(start, pos - start));

                } else if (c == '[') {
                    pos++;
                    int start = pos;
                    while (pos < selector.Length && selector[pos] != ']') pos++;
                    string attrExpr = selector.Substring(start, pos - start);
                    pos++;

                    int eqIndex = attrExpr.IndexOf('=');
                    if (eqIndex == -1) {
                        attrSelectors.Add((attrExpr.Trim().ToLowerInvariant(), null));
                    } else {
                        string attrKey = attrExpr.Substring(0, eqIndex).Trim().ToLowerInvariant();
                        string attrVal = attrExpr.Substring(eqIndex + 1).Trim().Trim('"', '\'');
                        attrSelectors.Add((attrKey, attrVal));
                    }

                } else if (c == ':') {
                    pos++;
                    while (pos < selector.Length && selector[pos] != '.' && 
                           selector[pos] != '#' && selector[pos] != '[' && 
                           selector[pos] != ':') pos++;

                } else {
                    int start = pos;
                    while (pos < selector.Length && selector[pos] != '.' && 
                           selector[pos] != '#' && selector[pos] != '[' && 
                           selector[pos] != ':') pos++;
                    string tagStr = selector.Substring(start, pos - start);
                    if (!string.IsNullOrEmpty(tagStr)) tag = tagStr;
                }
            }

            if (tag != null && !string.Equals(node.TagName, tag, StringComparison.OrdinalIgnoreCase))
                return false;

            if (id != null && !string.Equals(node.ElementId, id, StringComparison.OrdinalIgnoreCase))
                return false;

            if (classes.Any()) {
                if (node.Classes == null || !node.Classes.Any()) return false;
                foreach (var cls in classes)
                    if (!node.Classes.Contains(cls, StringComparer.OrdinalIgnoreCase))
                        return false;
            }

            if (attrSelectors.Any()) {
                foreach (var (attrKey, attrVal) in attrSelectors) {
                    if (!node.Attributes.ContainsKey(attrKey))
                        return false;

                    if (attrVal != null && !string.Equals(node.Attributes[attrKey], attrVal, StringComparison.OrdinalIgnoreCase))
                        return false;
                }
            }

            return true;
        }

        private static bool EvaluateCombinator(DomNode node, string selector) {
            var tokens = TokenizeSelector(selector);
            if (tokens.Count == 0) return false;

            int i = tokens.Count - 1;
            DomNode? currentNode = node;

            if (!MatchesSingle(currentNode, tokens[i])) return false;
            i--;

            while (i >= 0) {
                string token = tokens[i];
                bool isCombinator = token == ">" || token == "+" || token == "~" || token == " ";

                string combinator;
                string targetSelector;

                if (isCombinator) {
                    combinator = token;
                    i--;
                    if (i < 0) return false;
                    targetSelector = tokens[i];
                } else {
                    combinator = " ";
                    targetSelector = token;
                }

                if (combinator == ">") {
                    currentNode = GetParent(currentNode);
                    if (currentNode == null || !MatchesSingle(currentNode, targetSelector)) return false;
                } else if (combinator == " ") {
                    bool found = false;
                    currentNode = GetParent(currentNode);
                    while (currentNode != null) {
                        if (MatchesSingle(currentNode, targetSelector)) { found = true; break; }
                        currentNode = GetParent(currentNode);
                    }
                    if (!found) return false;
                } else if (combinator == "+") {
                    currentNode = GetPreviousSibling(currentNode);
                    if (currentNode == null || !MatchesSingle(currentNode, targetSelector)) return false;
                } else if (combinator == "~") {
                    bool found = false;
                    currentNode = GetPreviousSibling(currentNode);
                    while (currentNode != null) {
                        if (MatchesSingle(currentNode, targetSelector)) { found = true; break; }
                        currentNode = GetPreviousSibling(currentNode);
                    }
                    if (!found) return false;
                }

                i--;
            }

            return true;
        }

        private static List<string> TokenizeSelector(string selector) {
            var tokens = new List<string>();
            int pos = 0;

            while (pos < selector.Length) {
                while (pos < selector.Length && char.IsWhiteSpace(selector[pos])) pos++;
                if (pos >= selector.Length) break;

                char c = selector[pos];
                if (c == '>' || c == '+' || c == '~') {
                    if (tokens.Count > 0 && tokens[tokens.Count - 1] == " ")
                        tokens.RemoveAt(tokens.Count - 1);
                    tokens.Add(c.ToString());
                    pos++;
                } else {
                    int start = pos;
                    while (pos < selector.Length && !char.IsWhiteSpace(selector[pos]) &&
                           selector[pos] != '>' && selector[pos] != '+' && selector[pos] != '~') {
                        if (selector[pos] == '[') {
                            while (pos < selector.Length && selector[pos] != ']') pos++;
                            if (pos < selector.Length) pos++;
                        } else {
                            pos++;
                        }
                    }
                    tokens.Add(selector.Substring(start, pos - start));

                    bool hadSpace = false;
                    while (pos < selector.Length && char.IsWhiteSpace(selector[pos])) {
                        pos++;
                        hadSpace = true;
                    }

                    if (hadSpace && pos < selector.Length &&
                        selector[pos] != '>' && selector[pos] != '+' && selector[pos] != '~') {
                        tokens.Add(" ");
                    }
                }
            }
            return tokens;
        }

        private static DomNode? GetParent(DomNode? node) {
            if (node != null && node.Up != null && node.Up[0] != node)
                return node.Up[0];
            return null;
        }

        private static DomNode? GetPreviousSibling(DomNode? node) {
            var parent = GetParent(node);
            if (parent == null) return null;
            int index = parent.Children.IndexOf(node!);
            for (int i = index - 1; i >= 0; i--)
                if (!parent.Children[i].IsTextNode)
                    return parent.Children[i];
            return null;
        }
    }
}