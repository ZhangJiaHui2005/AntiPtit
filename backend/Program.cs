using AntiPtit.Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Cấu hình chính sách CORS cho phép Next.js gọi sang
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJS", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // Điền domain/port chạy Next.js của bạn
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 2. Đăng ký UserService dạng Singleton hoặc Scoped phù hợp với kết nối Mongo Client
builder.Services.AddScoped<UserService>();

var app = builder.Build();

app.UseHttpsRedirection();

// 3. Sử dụng CORS trước bước Authorization
app.UseCors("AllowNextJS");

app.UseAuthorization();
app.MapControllers();

app.Run();