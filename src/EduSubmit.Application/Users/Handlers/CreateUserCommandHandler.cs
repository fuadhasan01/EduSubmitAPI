using EduSubmit.Application.Common.Interfaces;
using EduSubmit.Application.Users.Commands;
using EduSubmit.Application.Users.DTOs;
using EduSubmit.Application.Users.Reader;
using EduSubmit.Application.Users.Writer;
using EduSubmit.Domain.Common;
using EduSubmit.Domain.Entities;
using EduSubmit.Domain.Enums;
using MediatR;

namespace EduSubmit.Application.Users.Handlers;

public sealed class CreateUserCommandHandler
    : IRequestHandler<CreateUserCommand, Result<UserResponse>>
{
    private readonly IUserReader _userReader;
    private readonly IUserWriter _userWriter;
    private readonly IPasswordHasher _passwordHasher;

    public CreateUserCommandHandler(
        IUserReader userReader,
        IUserWriter userWriter,
        IPasswordHasher passwordHasher)
    {
        _userReader = userReader;
        _userWriter = userWriter;
        _passwordHasher = passwordHasher;
    }

    public async Task<Result<UserResponse>> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim();
        var emailExists = await _userReader.ExistsByEmailAsync(email, cancellationToken);

        if (emailExists)
        {
            return Result<UserResponse>.Failure("A user with this email already exists.");
        }

        // Validate the role
        if (!Enum.TryParse<EnumUserRole>(request.Role.ToString(), true, out var role))
        {
            return Result<UserResponse>.Failure("Invalid role specified.");
        }

        var passwordHash = _passwordHasher.Hash(request.Password);

        var emailValueObject = Email.Create(email).ValueOrThrow();

        var userResult = User.Create(
            request.FullName,
            emailValueObject,
            passwordHash,
            role);

        if (userResult.IsFailure)
        {
            return Result<UserResponse>.Failure(userResult.Error!);
        }

        var user = userResult.Value!;

        await _userWriter.AddAsync(user, cancellationToken);

        await _userWriter.SaveChangesAsync(cancellationToken);

        var response = new UserResponse(
            user.Id,
            user.FullName,
            user.Email.Value,
            user.Role,
            user.CreatedAt);

        return Result<UserResponse>.Success(response);
    }
}