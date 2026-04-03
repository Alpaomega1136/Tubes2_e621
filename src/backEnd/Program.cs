var builder = WebApplication.CreateBuilder(args);

// Tambahkan layanan Swagger untuk dokumentasi API
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Konfigurasi CORS agar frontend Vite (Port 5173) diizinkan mengakses API ini
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowViteFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173") // Port default Vite
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Aktifkan middleware CORS
app.UseCors("AllowViteFrontend");

// Endpoint POST untuk menerima data penelusuran dari frontend
app.MapPost("/api/traverse", (TraversalRequest request) =>
{
    // TODO: Implementasikan Scraping HTML (misal via HtmlAgilityPack),
    // pembentukan pohon DOM, dan algoritma BFS/DFS di bagian ini.

    // Untuk sementara, kita kembalikan response dummy
    return Results.Ok(new 
    {
        Message = $"Sukses! Menelusuri {request.Url} dengan algoritma {request.Algorithm} mencari selector '{request.Selector}'.",
        // Nanti diisi dengan data node hasil traversal sungguhan
        TraversalLog = new[] { "html", "body", "div.container", "p.target" },
        TimeTakenMs = 15,
        NodesVisited = 42
    });
})
.WithName("TraverseDom");

app.Run();

// Representasi struktur data yang dikirim dari Frontend
public record TraversalRequest(string Url, string Selector, string Algorithm);