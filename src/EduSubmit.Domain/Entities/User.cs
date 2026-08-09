using EduSubmit.Domain.Common;
using EduSubmit.Domain.Enums;

namespace EduSubmit.Domain.Entities;

public sealed class User : AggregateRoot<Guid>
{
    public string FullName { get; private set; } = null!;

    public Email Email { get; private set; } = null!;

    public string PasswordHash { get; private set; } = null!;

    public EnumUserRole Role { get; private set; }

    public DateTime CreatedAt { get; private set; }

    public bool IsActive { get; private set; }

    private User()
        : base(Guid.Empty)
    {
    }
    private User(
        Guid id,
        string fullName,
        Email email,
        string passwordHash,
        EnumUserRole role,
        DateTime createdAt,
        bool isActive = true)
        : base(id)
    {
        FullName = fullName;
        Email = email;
        PasswordHash = passwordHash;
        Role = role;
        CreatedAt = createdAt;
        IsActive = isActive;
    }

    public static Result<User> Create(
        string fullName,
        Email email,
        string passwordHash,
        EnumUserRole role)
    {
        if (string.IsNullOrWhiteSpace(fullName))
            return Result<User>.Failure("Full name is required.");

        if (email is null)
            return Result<User>.Failure("Email is required.");

        if (string.IsNullOrWhiteSpace(passwordHash))
            return Result<User>.Failure("Password hash is required.");

        if (!Enum.IsDefined(role))
            return Result<User>.Failure("Invalid user role.");

        var user = new User(
            Guid.NewGuid(),
            fullName.Trim(),
            email,
            passwordHash,
            role,
            DateTime.UtcNow,
            true);

        return Result<User>.Success(user);
    }

    public Result Deactivate()
    {
        if (!IsActive) return Result.Failure("User is already deactivated.");

        IsActive = false;

        return Result.Success();
    }
}