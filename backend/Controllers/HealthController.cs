using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using MongoDB.Bson;
using Microsoft.Extensions.Configuration;
using System;
using System.Threading.Tasks;

namespace AntiPtit.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public HealthController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpGet("mongo")]
        public async Task<IActionResult> CheckMongo()
        {
            try
            {
                var connectionString = _configuration["MongoDbSettings:ConnectionString"];
                var databaseName = _configuration["MongoDbSettings:DatabaseName"];

                if (string.IsNullOrEmpty(connectionString) || string.IsNullOrEmpty(databaseName))
                {
                    return BadRequest(new { ok = false, message = "MongoDB connection not configured." });
                }

                var client = new MongoClient(connectionString);
                var database = client.GetDatabase(databaseName);

                // ping command
                var result = await database.RunCommandAsync<BsonDocument>(new BsonDocument("ping", 1));

                // Return the raw JSON produced by the BsonDocument to avoid System.Text.Json
                // trying to serialize MongoDB.Bson types which can cause InvalidCastException.
                var json = result.ToJson();
                return Content(json, "application/json");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { ok = false, error = ex.Message });
            }
        }
    }
}
