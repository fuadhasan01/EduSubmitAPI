namespace EduSubmit.Application.Users.DTOs;

public sealed record LoginResponse(
    string Token,
    Guid UserId,
    string Email,
    string Role);