var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowViteFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
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

app.UseCors("AllowViteFrontend");

app.MapPost("/api/scrape", (IHttpClientFactory httpClientFactory) =>
{
    return Results.Ok();
}).WithName("ScrapeHtml");

app.MapPost("/api/traverse", (IHttpClientFactory httpClientFactory) =>
{
    return Results.Ok();
}).WithName("TraverseDom");

app.Run();
