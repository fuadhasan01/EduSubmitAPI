using EduSubmit.Domain.Common;
using MediatR;

namespace EduSubmit.Application.Assignments.Commands;

public sealed record UpdateAssignmentCommand(
    Guid AssignmentId,
    string Title,
    string? Description,
    Guid SubjectId,
    Guid ClassId,
    DateTime Deadline,
    int MaxMarks) : IRequest<Result>;