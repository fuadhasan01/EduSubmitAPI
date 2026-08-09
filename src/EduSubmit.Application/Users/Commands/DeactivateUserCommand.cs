using EduSubmit.Domain.Common;
using MediatR;

namespace EduSubmit.Application.Users.Commands;

public sealed record DeactivateUserCommand(
    Guid UserId
) : IRequest<Result>;