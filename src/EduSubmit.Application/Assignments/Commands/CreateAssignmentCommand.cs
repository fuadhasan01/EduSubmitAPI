using EduSubmit.Domain.Common;
using MediatR;

namespace EduSubmit.Application.Assignments.Commands;

public sealed record CreateAssignmentCommand(
    string Title,
    string? Description,
    Guid SubjectId,
    Guid ClassId,
    DateTime Deadline,
    int MaxMarks,
    bool PublishImmediately) : IRequest<Result<Guid>>;