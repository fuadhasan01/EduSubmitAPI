namespace EduSubmit.Api.Models.Submissions;

public sealed record GradeSubmissionRequest(
    decimal Marks,
    string? Feedback);