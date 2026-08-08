using EduSubmit.Application.Users.DTOs;
using EduSubmit.Domain.Common;
using MediatR;

namespace EduSubmit.Application.Users.Commands;

public sealed record LoginCommand(
    string Email,
    string Password
) : IRequest<Result<LoginResponse>>;