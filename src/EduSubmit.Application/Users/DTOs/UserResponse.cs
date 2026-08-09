using EduSubmit.Domain.Enums;

namespace EduSubmit.Application.Users.DTOs;

public sealed record UserResponse(
    Guid Id,
    string FullName,
    string Email,
    EnumUserRole Role,
    DateTime CreatedAt,
    bool IsActive);