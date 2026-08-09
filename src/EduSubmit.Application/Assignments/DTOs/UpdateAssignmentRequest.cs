namespace EduSubmit.Application.Assignments.DTOs;

public sealed record UpdateAssignmentRequest(
    string Title,
    string? Description,
    Guid SubjectId,
    Guid ClassId,
    DateTime Deadline,
    int MaxMarks);