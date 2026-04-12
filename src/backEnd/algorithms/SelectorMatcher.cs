using backEnd.models;
using System;
using System.Linq;

namespace backEnd.algorithms {
    public static class SelectorMatcher {
        public static bool Matches(DomNode node, string selector) {
            if (string.IsNullOrWhiteSpace(selector)) return false;
            selector = selector.Trim();

            if (selector.StartsWith("#")) {
                return string.Equals(node.ElementId, selector.Substring(1), StringComparison.OrdinalIgnoreCase);
            }
            else if (selector.StartsWith(".")) {
                string targetClass = selector.Substring(1);
                return node.Classes.Any(c => string.Equals(c, targetClass, StringComparison.OrdinalIgnoreCase));
            }
            else {
                return string.Equals(node.TagName, selector, StringComparison.OrdinalIgnoreCase);
            }
        }
    }
}