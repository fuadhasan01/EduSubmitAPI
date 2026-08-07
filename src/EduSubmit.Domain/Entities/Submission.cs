using EduSubmit.Domain.Common;
using EduSubmit.Domain.Enums;
using EduSubmit.Domain.Events;

namespace EduSubmit.Domain.Entities;

public sealed class Submission : AggregateRoot<Guid>
{
    public Guid AssignmentId { get; private set; }

    public Guid StudentId { get; private set; }

    public string? Content { get; private set; }

    public string? FileUrl { get; private set; }

    public DateTime SubmittedAt { get; private set; }

    public EnumSubmissionStatus Status { get; private set; }

    public decimal? Marks { get; private set; }

    public string? Feedback { get; private set; }

    public DateTime? GradedAt { get; private set; }

    private Submission(
        Guid id,
        Guid assignmentId,
        Guid studentId,
        string? content,
        string? fileUrl,
        DateTime submittedAt,
        EnumSubmissionStatus status)
        : base(id)
    {
        AssignmentId = assignmentId;
        StudentId = studentId;
        Content = content;
        FileUrl = fileUrl;
        SubmittedAt = submittedAt;
        Status = status;
    }

    public static Result<Submission> Create(
        Guid assignmentId,
        Guid studentId,
        string? content,
        string? fileUrl,
        DateTime assignmentDeadline)
    {
        if (assignmentId == Guid.Empty)
            return Result<Submission>.Failure(
                "Assignment ID is required.");

        if (studentId == Guid.Empty)
            return Result<Submission>.Failure(
                "Student ID is required.");

        if (string.IsNullOrWhiteSpace(content) &&
            string.IsNullOrWhiteSpace(fileUrl))
        {
            return Result<Submission>.Failure(
                "Submission must contain content or a file URL.");
        }

        var submittedAt = DateTime.UtcNow;

        var status = submittedAt > assignmentDeadline
            ? EnumSubmissionStatus.Late
            : EnumSubmissionStatus.Submitted;

        var submission = new Submission(
            Guid.NewGuid(),
            assignmentId,
            studentId,
            content?.Trim(),
            fileUrl?.Trim(),
            submittedAt,
            status);

        submission.AddDomainEvent(
            new SubmissionCreatedEvent(
                submission.Id,
                assignmentId,
                studentId,
                submittedAt));

        return Result<Submission>.Success(submission);
    }

    public Result Update(
        string? content,
        string? fileUrl,
        DateTime assignmentDeadline)
    {
        if (DateTime.UtcNow > assignmentDeadline)
            return Result.Failure(
                "Submission cannot be updated after the assignment deadline.");

        if (Status == EnumSubmissionStatus.Graded)
            return Result.Failure(
                "A graded submission cannot be updated.");

        if (string.IsNullOrWhiteSpace(content) &&
            string.IsNullOrWhiteSpace(fileUrl))
        {
            return Result.Failure(
                "Submission must contain content or a file URL.");
        }

        Content = content?.Trim();
        FileUrl = fileUrl?.Trim();

        return Result.Success();
    }

    public Result Grade(
        decimal marks,
        string? feedback,
        decimal maxMarks)
    {
        if (marks < 0)
            return Result.Failure(
                "Marks cannot be negative.");

        if (maxMarks <= 0)
            return Result.Failure(
                "Maximum marks must be greater than zero.");

        if (marks > maxMarks)
            return Result.Failure(
                "Marks cannot exceed the assignment maximum marks.");

        if (Status == EnumSubmissionStatus.Graded)
            return Result.Failure(
                "Submission is already graded.");

        Marks = marks;
        Feedback = feedback?.Trim();
        GradedAt = DateTime.UtcNow;
        Status = EnumSubmissionStatus.Graded;

        AddDomainEvent(
            new SubmissionGradedEvent(
                Id,
                AssignmentId,
                StudentId,
                marks,
                GradedAt.Value));

        return Result.Success();
    }
}