using Microsoft.AspNetCore.Mvc;
using AntiPtit.Backend.Services;
using AntiPtit.Backend.Dtos;
using System.Threading.Tasks;
using System.IO;
using System.Text.Json;
using System;

namespace AntiPtit.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClerkWebhookController : ControllerBase
    {
        private readonly UserService _userService;

        public ClerkWebhookController(UserService userService)
        {
            _userService = userService;
        }

        [HttpPost("webhook")]
        public async Task<IActionResult> HandleWebhook()
        {
            // NOTE: In production you should verify the Clerk webhook signature.
            // This endpoint is permissive for quick local testing.

            string body;
            using (var reader = new StreamReader(Request.Body))
            {
                body = await reader.ReadToEndAsync();
            }

            if (string.IsNullOrEmpty(body))
            {
                return BadRequest();
            }

            try
            {
                using var doc = JsonDocument.Parse(body);
                var root = doc.RootElement;

                // The event type may be at root.type
                var eventType = root.TryGetProperty("type", out var t) ? t.GetString() : null;

                if (string.Equals(eventType, "user.created", StringComparison.OrdinalIgnoreCase))
                {
                    // Try to locate the user object in common payload shapes
                    JsonElement? userElem = null;

                    if (root.TryGetProperty("data", out var dataElem))
                    {
                        if (dataElem.ValueKind == JsonValueKind.Object)
                        {
                            if (dataElem.TryGetProperty("user", out var u1)) userElem = u1;
                            else if (dataElem.TryGetProperty("object", out var u2)) userElem = u2;
                        }
                    }

                    // Fallback to root.data.object or root.data
                    if (userElem == null && root.TryGetProperty("data", out var dataFallback))
                    {
                        if (dataFallback.ValueKind == JsonValueKind.Object)
                            userElem = dataFallback;
                    }

                    if (userElem == null)
                    {
                        return BadRequest(new { success = false, message = "No user object found in webhook payload." });
                    }

                    var user = userElem.Value;

                    // Extract fields safely
                    var clerkId = user.TryGetProperty("id", out var idProp) ? idProp.GetString() : null;

                    string email = null;
                    if (user.TryGetProperty("primary_email_address", out var primaryEmail) && primaryEmail.ValueKind == JsonValueKind.Object)
                    {
                        if (primaryEmail.TryGetProperty("email_address", out var e)) email = e.GetString();
                    }

                    if (string.IsNullOrEmpty(email) && user.TryGetProperty("email_addresses", out var emails) && emails.ValueKind == JsonValueKind.Array && emails.GetArrayLength() > 0)
                    {
                        var first = emails[0];
                        if (first.TryGetProperty("email_address", out var e2)) email = e2.GetString();
                    }

                    string displayName = null;
                    if (user.TryGetProperty("full_name", out var fullName)) displayName = fullName.GetString();
                    else
                    {
                        var first = user.TryGetProperty("first_name", out var fn) ? fn.GetString() : null;
                        var last = user.TryGetProperty("last_name", out var ln) ? ln.GetString() : null;
                        displayName = string.Join(" ", new[] { first, last }).Trim();
                    }

                    string avatar = null;
                    if (user.TryGetProperty("profile_image_url", out var avatarProp)) avatar = avatarProp.GetString();

                    string username = null;
                    if (user.TryGetProperty("username", out var usernameProp)) username = usernameProp.GetString();

                    if (string.IsNullOrEmpty(clerkId) || string.IsNullOrEmpty(email))
                    {
                        return BadRequest(new { success = false, message = "Required user fields missing (id/email)." });
                    }

                    var dto = new UserSyncDto
                    {
                        ClerkId = clerkId,
                        Email = email,
                        DisplayName = displayName ?? email,
                        Avatar = avatar ?? string.Empty,
                        Username = username ?? email.Split('@')[0]
                    };

                    var result = await _userService.SyncUserAsync(dto);

                    return Ok(new { success = true, user = result });
                }

                // For other event types just acknowledge
                return Ok(new { success = true, message = "Event ignored." });
            }
            catch (JsonException je)
            {
                return BadRequest(new { success = false, message = "Invalid JSON", error = je.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Server error", error = ex.Message });
            }
        }
    }
}
