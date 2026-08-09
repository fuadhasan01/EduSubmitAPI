using EduSubmit.Domain.Common;
using MediatR;

namespace EduSubmit.Application.Assignments.Commands;

public sealed record PublishAssignmentCommand(Guid AssignmentId) : IRequest<Result>;