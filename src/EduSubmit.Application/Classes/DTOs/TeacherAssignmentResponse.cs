namespace EduSubmit.Application.Classes.DTOs;

public sealed record TeacherAssignmentResponse(
    Guid SubjectId,
    string SubjectName,
    Guid TeacherId,
    string TeacherName);
