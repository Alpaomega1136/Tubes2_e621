using System;
using System.Net.Http;
using System.Threading.Tasks;

namespace backEnd.services {
    public class HtmlProviderService {
        private readonly HttpClient client;

        public HtmlProviderService() {
            client = new HttpClient();
            client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
        }

        public async Task<string> GetHtmlAsync(string url, string rawHtml) {
            if (!string.IsNullOrEmpty(rawHtml)) return rawHtml;
            
            if (!string.IsNullOrEmpty(url)) {
                return await client.GetStringAsync(url);
            }
            
            throw new Exception("URL atau Raw HTML harus diisi.");
        }
    }
}