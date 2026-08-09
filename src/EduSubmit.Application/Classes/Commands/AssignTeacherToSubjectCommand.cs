using EduSubmit.Domain.Common;
using MediatR;

namespace EduSubmit.Application.Classes.Commands;

public sealed record AssignTeacherToSubjectCommand(
    Guid TeacherId,
    Guid SubjectId) : IRequest<Result>;