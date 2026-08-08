using EduSubmit.Application.Common.Interfaces;

namespace EduSubmit.Infrastructure.Authentication;

public sealed class BCryptPasswordHasher : IPasswordHasher
{
    private const int WorkFactor = 12;
    public string Hash(string password)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(password);
        return BCrypt.Net.BCrypt.HashPassword(password, WorkFactor);
    }

    public bool Verify(string password, string hash)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(password);
        ArgumentException.ThrowIfNullOrWhiteSpace(hash);
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }
}