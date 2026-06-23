using Microsoft.AspNetCore.Mvc;
using AntiPtit.Backend.Dtos;
using AntiPtit.Backend.Services;
using System;
using System.Threading.Tasks;

namespace AntiPtit.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly UserService _userService;

        public UsersController(UserService userService)
        {
            _userService = userService;
        }

        [HttpPost("sync")]
        public async Task<IActionResult> SyncUser([FromBody] UserSyncDto dto)
        {
            if (dto == null || string.IsNullOrEmpty(dto.ClerkId))
            {
                return BadRequest(new { success = false, message = "Dữ liệu đầu vào từ Clerk không hợp lệ." });
            }

            try
            {
                var result = await _userService.SyncUserAsync(dto);
                return Ok(new { success = true, user = result });
            }
            catch (Exception ex)
            {
                // Ghi log lỗi nếu có biến cố hệ thống xảy ra
                return StatusCode(500, new { success = false, message = "Lỗi đồng bộ cơ sở dữ liệu MongoDB.", error = ex.Message });
            }
        }

        [HttpPost("sync-all-clerk")]
        public async Task<IActionResult> SyncAllFromClerk()
        {
            try
            {
                var count = await _userService.SyncAllFromClerkAsync();
                return Ok(new { success = true, imported = count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}