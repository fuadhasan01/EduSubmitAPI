using EduSubmit.Application.Users.DTOs;
using EduSubmit.Domain.Common;
using EduSubmit.Domain.Enums;
using MediatR;

namespace EduSubmit.Application.Users.Commands;

public sealed record CreateUserCommand(
    string FullName,
    string Email,
    string Password,
    EnumUserRole Role
) : IRequest<Result<UserResponse>>;