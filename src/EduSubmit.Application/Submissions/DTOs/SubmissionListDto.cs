namespace EduSubmit.Application.Submissions.Dtos;

public sealed record SubmissionListDto(
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