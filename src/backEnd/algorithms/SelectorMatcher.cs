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

            int lastPos = 0;
            char mode = '\0';

            Action<string> assignValue = (val) => {
                if (string.IsNullOrEmpty(val)) return;
                if (mode == '\0') tag = val;
                else if (mode == '#') id = val;
                else if (mode == '.') classes.Add(val);
            };

            for (int pos = 0; pos < selector.Length; pos++) {
                char c = selector[pos];
                if (c == '#' || c == '.' || c == ':') {
                    assignValue(selector.Substring(lastPos, pos - lastPos));
                    mode = c;
                    lastPos = pos + 1;
                }
            }
            assignValue(selector.Substring(lastPos));

            if (tag != null && !string.Equals(node.TagName, tag, StringComparison.OrdinalIgnoreCase))
                return false;

            if (id != null && !string.Equals(node.ElementId, id, StringComparison.OrdinalIgnoreCase))
                return false;

            if (classes.Any()) {
                if (node.Classes == null || !node.Classes.Any()) return false;
                foreach (var cls in classes) {
                    if (!node.Classes.Contains(cls, StringComparer.OrdinalIgnoreCase))
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
                    if (tokens.Count > 0 && tokens[tokens.Count - 1] == " ") tokens.RemoveAt(tokens.Count - 1);
                    tokens.Add(c.ToString());
                    pos++;
                } else {
                    int start = pos;
                    while (pos < selector.Length && !char.IsWhiteSpace(selector[pos]) &&
                           selector[pos] != '>' && selector[pos] != '+' && selector[pos] != '~') {
                        pos++;
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
            for (int i = index - 1; i >= 0; i--) {
                if (!parent.Children[i].IsTextNode)
                    return parent.Children[i];
            }
            return null;
        }
    }
}