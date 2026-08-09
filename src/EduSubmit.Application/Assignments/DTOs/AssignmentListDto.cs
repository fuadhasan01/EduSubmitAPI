namespace EduSubmit.Application.Assignments.Dtos;

public sealed record AssignmentListDto(
    Guid Id,
    string Title,
    string Description,
    Guid SubjectId,
    Guid ClassId,
    Guid TeacherId,
    DateTime Deadline,
    decimal MaxMarks,
    string Status,
    DateTime CreatedAt);