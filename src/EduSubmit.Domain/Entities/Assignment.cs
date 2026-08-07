using EduSubmit.Domain.Common;
using EduSubmit.Domain.Enums;
using EduSubmit.Domain.Events;

namespace EduSubmit.Domain.Entities;

public sealed class Assignment : AggregateRoot<Guid>
{
    public string Title { get; private set; } = null!;

    public string Description { get; private set; } = null!;

    public Guid SubjectId { get; private set; }

    public Guid ClassId { get; private set; }

    public Guid TeacherId { get; private set; }

    public DateTime Deadline { get; private set; }

    public decimal MaxMarks { get; private set; }

    public EnumAssignmentStatus Status { get; private set; }

    public DateTime CreatedAt { get; private set; }

    private Assignment(
        Guid id,
        string title,
        string description,
        Guid subjectId,
        Guid classId,
        Guid teacherId,
        DateTime deadline,
        decimal maxMarks,
        DateTime createdAt)
        : base(id)
    {
        Title = title;
        Description = description;
        SubjectId = subjectId;
        ClassId = classId;
        TeacherId = teacherId;
        Deadline = deadline;
        MaxMarks = maxMarks;
        Status = EnumAssignmentStatus.Draft;
        CreatedAt = createdAt;
    }

    public static Result<Assignment> Create(
        string title,
        string description,
        Guid subjectId,
        Guid classId,
        Guid teacherId,
        DateTime deadline,
        decimal maxMarks)
    {
        if (string.IsNullOrWhiteSpace(title))
            return Result<Assignment>.Failure("Assignment title is required.");

        if (string.IsNullOrWhiteSpace(description))
            return Result<Assignment>.Failure("Assignment description is required.");

        if (subjectId == Guid.Empty)
            return Result<Assignment>.Failure("Subject ID is required.");

        if (classId == Guid.Empty)
            return Result<Assignment>.Failure("Class ID is required.");

        if (teacherId == Guid.Empty)
            return Result<Assignment>.Failure("Teacher ID is required.");

        if (deadline <= DateTime.UtcNow)
            return Result<Assignment>.Failure(
                "Assignment deadline must be in the future.");

        if (maxMarks <= 0)
            return Result<Assignment>.Failure(
                "Maximum marks must be greater than zero.");

        return Result<Assignment>.Success(
            new Assignment(
                Guid.NewGuid(),
                title.Trim(),
                description.Trim(),
                subjectId,
                classId,
                teacherId,
                deadline,
                maxMarks,
                DateTime.UtcNow));
    }

    public Result Publish()
    {
        if (Status == EnumAssignmentStatus.Published)
            return Result.Failure("Assignment is already published.");

        if (IsPastDeadline(DateTime.UtcNow))
            return Result.Failure(
                "A past-deadline assignment cannot be published.");

        Status = EnumAssignmentStatus.Published;

        AddDomainEvent(
            new AssignmentPublishedEvent(
                Id,
                DateTime.UtcNow));

        return Result.Success();
    }

    public Result Unpublish()
    {
        if (Status == EnumAssignmentStatus.Draft)
            return Result.Failure("Assignment is already unpublished.");

        Status = EnumAssignmentStatus.Draft;

        return Result.Success();
    }

    public bool IsPastDeadline(DateTime now) { return now > Deadline; }

    public Result UpdateDetails(
        string title,
        string description,
        DateTime deadline,
        decimal maxMarks)
    {
        if (string.IsNullOrWhiteSpace(title))
            return Result.Failure("Assignment title is required.");

        if (string.IsNullOrWhiteSpace(description))
            return Result.Failure("Assignment description is required.");

        if (deadline <= DateTime.UtcNow)
            return Result.Failure(
                "Assignment deadline must be in the future.");

        if (maxMarks <= 0)
            return Result.Failure(
                "Maximum marks must be greater than zero.");

        Title = title.Trim();
        Description = description.Trim();
        Deadline = deadline;
        MaxMarks = maxMarks;

        return Result.Success();
    }

    public bool IsValidMarks(decimal marks)
    {
        return marks >= 0 && marks <= MaxMarks;
    }
}