using backEnd.services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Diperlukan oleh HtmlProviderService untuk fetch HTML dari URL
builder.Services.AddHttpClient();

builder.Services.AddCors(options => {
    options.AddPolicy("AllowViteFrontend", policy => {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.MaxDepth = 256;
    });

builder.Services.AddScoped<DomParserService>();
builder.Services.AddScoped<TraversalService>();
builder.Services.AddScoped<HtmlProviderService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowViteFrontend");
app.MapControllers();

app.Run();
