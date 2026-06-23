using MongoDB.Driver;
using AntiPtit.Backend.Models;
using AntiPtit.Backend.Dtos;
using System;
using System.Threading.Tasks;
using System.Net.Http;
using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace AntiPtit.Backend.Services
{
    public class UserService
    {
        private readonly IMongoCollection<User> _usersCollection;
        private readonly IConfiguration _configuration;

        public UserService(IConfiguration configuration)
        {
            _configuration = configuration;
            var connectionString = configuration["MongoDbSettings:ConnectionString"];
            var databaseName = configuration["MongoDbSettings:DatabaseName"];
            
            var client = new MongoClient(connectionString);
            var database = client.GetDatabase(databaseName);
            
            _usersCollection = database.GetCollection<User>("Users");
        }

        public async Task<User> SyncUserAsync(UserSyncDto dto)
        {
            var filter = Builders<User>.Filter.Eq(u => u.ClerkId, dto.ClerkId);
            var existingUser = await _usersCollection.Find(filter).FirstOrDefaultAsync();

            if (existingUser == null)
            {
                var newUser = new User
                {
                    ClerkId = dto.ClerkId,
                    Username = dto.Username.ToLower(),
                    Email = dto.Email,
                    DisplayName = dto.DisplayName,
                    Avatar = dto.Avatar,
                    PasswordHash = null,
                    Bio = "",
                    Role = "user",
                    Status = "active",
                    CreatedAt = DateTime.UtcNow
                };

                await _usersCollection.InsertOneAsync(newUser);
                return newUser;
            }
            else
            {
                var update = Builders<User>.Update
                    .Set(u => u.DisplayName, dto.DisplayName)
                    .Set(u => u.Avatar, dto.Avatar);

                await _usersCollection.UpdateOneAsync(filter, update);

                existingUser.DisplayName = dto.DisplayName;
                existingUser.Avatar = dto.Avatar;
                return existingUser;
            }
        }

        // Fetch all users from Clerk Admin API and sync into MongoDB.
        public async Task<int> SyncAllFromClerkAsync()
        {
            var clerkApiKey = _configuration["Clerk:ApiKey"];
            if (string.IsNullOrEmpty(clerkApiKey))
            {
                throw new InvalidOperationException("Clerk API key not configured (Clerk:ApiKey).");
            }

            using var http = new HttpClient();
            http.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", clerkApiKey);

            // Clerk Admin API v1: GET /v1/users
            var url = "https://api.clerk.com/v1/users";
            var resp = await http.GetAsync(url);
            resp.EnsureSuccessStatusCode();

            var content = await resp.Content.ReadAsStringAsync();

            using var doc = JsonDocument.Parse(content);
            var root = doc.RootElement;

            JsonElement.ArrayEnumerator enumerator;
            if (root.ValueKind == JsonValueKind.Array)
            {
                enumerator = root.EnumerateArray();
            }
            else if (root.ValueKind == JsonValueKind.Object && root.TryGetProperty("data", out var dataProp) && dataProp.ValueKind == JsonValueKind.Array)
            {
                enumerator = dataProp.EnumerateArray();
            }
            else
            {
                throw new InvalidOperationException("Unexpected Clerk response shape when listing users.");
            }

            int count = 0;
            foreach (var user in enumerator)
            {
                try
                {
                    // 1. Lấy Clerk ID an toàn
                    var clerkId = user.TryGetProperty("id", out var idProp) && idProp.ValueKind == JsonValueKind.String 
                        ? idProp.GetString() 
                        : null;

                    if (string.IsNullOrEmpty(clerkId))
                    {
                        Console.WriteLine("⚠️ Phát hiện một bản ghi không có Clerk ID hợp lệ, bỏ qua.");
                        continue;
                    }

                    // 2. Tìm kiếm Email dựa trên primary_email_address_id
                    string email = null;
                    var primaryEmailId = user.TryGetProperty("primary_email_address_id", out var pIdProp) && pIdProp.ValueKind == JsonValueKind.String
                        ? pIdProp.GetString()
                        : null;

                    if (user.TryGetProperty("email_addresses", out var emails) && emails.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var emailItem in emails.EnumerateArray())
                        {
                            var currentEmailId = emailItem.TryGetProperty("id", out var eId) ? eId.GetString() : null;
                            var emailAddressValue = emailItem.TryGetProperty("email_address", out var eAddr) ? eAddr.GetString() : null;

                            // Ưu tiên email trùng khớp với ID chính
                            if (currentEmailId == primaryEmailId && !string.IsNullOrEmpty(emailAddressValue))
                            {
                                email = emailAddressValue;
                                break;
                            }

                            // Phương án dự phòng nếu không map được ID chính: Lấy email hợp lệ đầu tiên bắt gặp
                            if (email == null && !string.IsNullOrEmpty(emailAddressValue))
                            {
                                email = emailAddressValue;
                            }
                        }
                    }

                    if (string.IsNullOrEmpty(email))
                    {
                        Console.WriteLine($"⚠️ User {clerkId} không tìm thấy Email liên kết, bỏ qua.");
                        continue;
                    }

                    // 3. Xử lý hiển thị Tên (DisplayName) tránh lỗi null chuỗi
                    string firstName = user.TryGetProperty("first_name", out var fn) && fn.ValueKind == JsonValueKind.String ? fn.GetString() : null;
                    string lastName = user.TryGetProperty("last_name", out var ln) && ln.ValueKind == JsonValueKind.String ? ln.GetString() : null;
                    
                    string displayName = null;
                    if (!string.IsNullOrEmpty(firstName) || !string.IsNullOrEmpty(lastName))
                    {
                        displayName = string.Join(" ", new[] { firstName, lastName }).Trim();
                    }
                    
                    if (string.IsNullOrEmpty(displayName) && user.TryGetProperty("full_name", out var fnProp) && fnProp.ValueKind == JsonValueKind.String)
                    {
                        displayName = fnProp.GetString();
                    }

                    // 4. Lấy Username an toàn
                    string username = user.TryGetProperty("username", out var usernameProp) && usernameProp.ValueKind == JsonValueKind.String 
                        ? usernameProp.GetString() 
                        : null;

                    // 5. Lấy Avatar an toàn (Clerk v1 đổi sang 'image_url')
                    string avatar = null;
                    if (user.TryGetProperty("image_url", out var imgProp) && imgProp.ValueKind == JsonValueKind.String)
                    {
                        avatar = imgProp.GetString();
                    }
                    else if (user.TryGetProperty("profile_image_url", out var profProp) && profProp.ValueKind == JsonValueKind.String)
                    {
                        avatar = profProp.GetString();
                    }

                    // 6. Đóng gói DTO để đồng bộ vào cơ sở dữ liệu
                    var dto = new UserSyncDto
                    {
                        ClerkId = clerkId,
                        Email = email,
                        DisplayName = !string.IsNullOrEmpty(displayName) ? displayName : email,
                        Avatar = avatar ?? string.Empty,
                        Username = !string.IsNullOrEmpty(username) ? username : email.Split('@')[0]
                    };

                    await SyncUserAsync(dto);
                    count++;
                }
                catch (Exception ex)
                {
                    // Đã thêm Log để bạn nhìn thấy chi tiết lỗi nếu phát sinh biến cố khác
                    Console.WriteLine($"❌ Lỗi khi xử lý đồng bộ một User từ Clerk Dashboard: {ex.Message}");
                    continue;
                }
            }

            return count;
        }
    }
}