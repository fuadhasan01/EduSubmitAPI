using EduSubmit.Domain.Common;
using MediatR;

namespace EduSubmit.Application.Assignments.Commands;

public sealed record DeleteAssignmentCommand(Guid AssignmentId) : IRequest<Result>;