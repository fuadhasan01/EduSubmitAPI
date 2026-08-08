namespace EduSubmit.Application.Common.Interfaces;

public interface IJwtService
{
    string GenerateToken(
        Guid userId,
        string email,
        string role);
}