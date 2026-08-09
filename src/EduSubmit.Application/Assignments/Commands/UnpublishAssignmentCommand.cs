using EduSubmit.Domain.Common;
using MediatR;

namespace EduSubmit.Application.Assignments.Commands;

public sealed record UnpublishAssignmentCommand(Guid AssignmentId) : IRequest<Result>;