using EduSubmit.Domain.Common;

namespace EduSubmit.Domain.Entities;

public sealed class Class : Entity<Guid>
{
    public string Name { get; private set; } = null!;

    private Class(
        Guid id,
        string name)
        : base(id)
    {
        Name = name;
    }

    public static Result<Class> Create(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result<Class>.Failure("Class name is required.");

        return Result<Class>.Success(
            new Class(
                Guid.NewGuid(),
                name.Trim()));
    }
}