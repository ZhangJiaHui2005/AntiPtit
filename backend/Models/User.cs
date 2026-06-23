using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace AntiPtit.Backend.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("clerk_id")]
        public string ClerkId { get; set; } = null!;

        [BsonElement("username")]
        public string Username { get; set; } = null!;

        [BsonElement("email")]
        public string Email { get; set; } = null!;

        [BsonElement("password_hash")]
        public string? PasswordHash { get; set; } = null; // Clerk quản lý, mặc định null

        [BsonElement("display_name")]
        public string DisplayName { get; set; } = null!;

        [BsonElement("avatar")]
        public string Avatar { get; set; } = "";

        [BsonElement("bio")]
        public string Bio { get; set; } = "";

        [BsonElement("role")]
        public string Role { get; set; } = "user";

        [BsonElement("status")]
        public string Status { get; set; } = "active";

        [BsonElement("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}