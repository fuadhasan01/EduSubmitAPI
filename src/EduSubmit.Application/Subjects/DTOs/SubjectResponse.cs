namespace EduSubmit.Application.Subjects.DTOs;

public sealed record SubjectResponse(
    Guid Id,
    string Name,
    Guid ClassId);