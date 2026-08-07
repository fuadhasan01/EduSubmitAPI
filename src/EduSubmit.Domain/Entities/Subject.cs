using EduSubmit.Domain.Common;

namespace EduSubmit.Domain.Entities;

public sealed class Subject : Entity<Guid>
{
    public string Name { get; private set; } = null!;

    public Guid ClassId { get; private set; }

    private Subject(
        Guid id,
        string name,
        Guid classId)
        : base(id)
    {
        Name = name;
        ClassId = classId;
    }

    public static Result<Subject> Create(
        string name,
        Guid classId)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result<Subject>.Failure("Subject name is required.");

        if (classId == Guid.Empty)
            return Result<Subject>.Failure("Class ID is required.");

        return Result<Subject>.Success(
            new Subject(
                Guid.NewGuid(),
                name.Trim(),
                classId));
    }
}