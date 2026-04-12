using Microsoft.AspNetCore.Mvc;
using backEnd.models;
using backEnd.services;
using System.Threading.Tasks;

namespace backEnd.controllers {
    [ApiController]
    [Route("api")]
    public class DomController : ControllerBase {
        private readonly DomParserService parserService_;
        private readonly TraversalService traversalService_;
        private readonly HtmlProviderService htmlProvider_;
        public DomController(DomParserService parserService, TraversalService traversalService, HtmlProviderService htmlProvider) {
            parserService_ = parserService;
            traversalService_ = traversalService;
            htmlProvider_ = htmlProvider; 
        }
        private int CountNodes(DomNode node) {
            if (node == null) return 0;
            int count = 1;
            foreach (var child in node.Children)
            {
                count += CountNodes(child);
            }
            return count;
        }

        [HttpPost("scrape")]
        public async Task<IActionResult> Scrape([FromBody] ScrapeRequest req) {
            try {
                var htmlContent = await htmlProvider_.GetHtmlAsync(req.Url, req.Html);
                var tree = parserService_.ParseAndPrepareLCA(htmlContent);
                
                var response = new ScrapeResponse {
                    Tree = tree,
                    MaxDepth = tree.Depth,
                    TotalNodes = CountNodes(tree)
                };

                return Ok(response);
            } 
            catch (System.Exception ex) {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("traverse")]
        public async Task<IActionResult> Traverse([FromBody] SearchRequest req) {
            try {
                var htmlContent = await htmlProvider_.GetHtmlAsync(req.Url, req.Html);
                var tree = parserService_.ParseAndPrepareLCA(htmlContent);
                
                var result = traversalService_.Traverse(tree, req.Selector, req.Algorithm, req.MaxResults);
                return Ok(result);
            }
            catch (System.Exception ex) {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}