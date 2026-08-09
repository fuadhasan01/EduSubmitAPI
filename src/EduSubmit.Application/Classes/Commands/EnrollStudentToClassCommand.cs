using EduSubmit.Domain.Common;
using MediatR;

namespace EduSubmit.Application.Classes.Commands;

public sealed record EnrollStudentToClassCommand(
    Guid StudentId,
    Guid ClassId) : IRequest<Result>;