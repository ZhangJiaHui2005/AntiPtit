namespace AntiPtit.Backend.Dtos
{
    public class UserSyncDto
    {
        public string ClerkId { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string DisplayName { get; set; } = null!;
        public string Avatar { get; set; } = "";
        public string Username { get; set; } = null!;
    }
}