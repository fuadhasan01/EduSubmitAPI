namespace EduSubmit.Application.Classes.DTOs;

public sealed record StudentEnrollmentResponse(
    Guid StudentId,
    string StudentName,
    Guid ClassId);
