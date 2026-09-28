using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebCafe.Backend.Common.Constants;
using WebCafe.Backend.Common.Models;
using WebCafe.Backend.Infrastructure.Data;
using WebCafe.Backend.Services.Abstraction;

namespace WebCafe.Backend.Controllers;

[ApiController]
[Route("api/me")]
[Authorize(Policy = AppPolicies.RequireAuthenticated)]
public class MeController : ControllerBase
{
    private readonly WebCafeDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public MeController(WebCafeDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    [HttpGet("stores")]
    public async Task<ActionResult<ApiResponse<List<MyStoreDto>>>> GetStores()
    {
        if (!_currentUser.TenantId.HasValue) return Ok(ApiResponse<List<MyStoreDto>>.Ok(new()));
        var stores = await _db.Stores.AsNoTracking()
            .Where(s => s.TenantId == _currentUser.TenantId.Value && s.IsActive)
            .OrderBy(s => s.StoreId)
            .Select(s => new MyStoreDto { StoreId = s.StoreId, Name = s.Name, IsActive = s.IsActive })
            .ToListAsync();
        return Ok(ApiResponse<List<MyStoreDto>>.Ok(stores));
    }
}

public sealed class MyStoreDto
{
    public int StoreId { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}
