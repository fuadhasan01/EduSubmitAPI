namespace EduSubmit.Application.Submissions.Dtos;

public sealed record SubmissionDetailsDto(
    Guid Id,
    Guid AssignmentId,
    Guid StudentId,
    string? Content,
    string? FileUrl,
    DateTime SubmittedAt,
    string Status,
    decimal? Marks,
    string? Feedback,
    DateTime? GradedAt);