using System.Security.Claims;
using EduSubmit.Application.Common.Interfaces;
using EduSubmit.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace EduSubmit.Infrastructure.Authentication;

public sealed class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(
        IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? UserId
    {
        get
        {
            var userId = _httpContextAccessor.HttpContext?
                .User
                .FindFirstValue(ClaimTypes.NameIdentifier);

            return Guid.TryParse(userId, out var id)
                ? id
                : null;
        }
    }

    public EnumUserRole Role
    {
        get
        {
            var role = _httpContextAccessor.HttpContext?
                .User
                .FindFirstValue(ClaimTypes.Role);

            return Enum.TryParse<EnumUserRole>(
                role,
                ignoreCase: true,
                out var parsedRole)
                ? parsedRole
                : default;
        }
    }
}