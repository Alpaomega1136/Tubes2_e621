using backEnd.models;
using System;
using System.Linq;
using System.Text.RegularExpressions;

namespace backEnd.algorithms {
    public static class SelectorMatcher {
        
        public static bool Matches(DomNode node, string selector) {
            if (string.IsNullOrWhiteSpace(selector)) return false;
            selector = selector.Trim();

            if (!Regex.IsMatch(selector, @"[\s>+~]")) {
                return MatchesSingle(node, selector);
            }

            return EvaluateCombinator(node, selector);
        }

        public static bool MatchesSingle(DomNode node, string selector) {
            if (selector == "*") return true;

            string id = null;
            var idMatch = Regex.Match(selector, @"#([a-zA-Z0-9_-]+)");
            if (idMatch.Success) id = idMatch.Groups[1].Value;

            var classes = Regex.Matches(selector, @"\.([a-zA-Z0-9_-]+)").Cast<Match>().Select(m => m.Groups[1].Value).ToList();

            string tag = null;
            var tagMatch = Regex.Match(selector, @"^([a-zA-Z0-9_-]+)");
            if (tagMatch.Success) tag = tagMatch.Groups[1].Value;

            if (tag != null && !string.Equals(node.TagName, tag, StringComparison.OrdinalIgnoreCase)) 
                return false;

            if (id != null && !string.Equals(node.ElementId, id, StringComparison.OrdinalIgnoreCase)) 
                return false;

            if (classes.Any()) {
                if (node.Classes == null || !node.Classes.Any()) return false;
                
                foreach (var cls in classes) {
                    if (!node.Classes.Contains(cls, StringComparer.OrdinalIgnoreCase)) {
                        return false;
                    }
                }
            }

            return true;
        }

        private static bool EvaluateCombinator(DomNode node, string selector) {
            string normalized = Regex.Replace(selector, @"\s+", " "); 
            normalized = Regex.Replace(normalized, @"\s*([>+~])\s*", " $1 "); 
            
            var tokens = normalized.Split(' ', StringSplitOptions.RemoveEmptyEntries);

            int i = tokens.Length - 1;
            DomNode currentNode = node;

            if (!MatchesSingle(currentNode, tokens[i])) return false;
            
            i--;
            while (i >= 0) {
                string token = tokens[i];
                
                bool isCombinator = token == ">" || token == "+" || token == "~";
                string combinator = isCombinator ? token : " ";
                
                string targetSelector = isCombinator ? tokens[--i] : token;

                if (combinator == ">") {
                    currentNode = GetParent(currentNode);
                    if (currentNode == null || !MatchesSingle(currentNode, targetSelector)) return false;
                }
                else if (combinator == " ") { 
                    bool foundAncestor = false;
                    currentNode = GetParent(currentNode);
                    
                    while (currentNode != null) {
                        if (MatchesSingle(currentNode, targetSelector)) {
                            foundAncestor = true;
                            break;
                        }
                        currentNode = GetParent(currentNode);
                    }
                    if (!foundAncestor) return false;
                }
                else if (combinator == "+") {
                    currentNode = GetPreviousSibling(currentNode);
                    if (currentNode == null || !MatchesSingle(currentNode, targetSelector)) return false;
                }
                else if (combinator == "~") {
                    bool foundSibling = false;
                    currentNode = GetPreviousSibling(currentNode);
                    
                    while (currentNode != null) {
                        if (MatchesSingle(currentNode, targetSelector)) {
                            foundSibling = true;
                            break;
                        }
                        currentNode = GetPreviousSibling(currentNode);
                    }
                    if (!foundSibling) return false;
                }
                
                i--;
            }
            
            return true;
        }


        private static DomNode GetParent(DomNode node) {
            if (node != null && node.Up != null && node.Up[0] != node) {
                return node.Up[0];
            }
            return null;
        }

        private static DomNode GetPreviousSibling(DomNode node) {
            var parent = GetParent(node);
            if (parent == null) return null;
            
            int index = parent.Children.IndexOf(node);
            
            if (index > 0) {
                return parent.Children[index - 1];
            }
            
            return null;
        }
    }
}