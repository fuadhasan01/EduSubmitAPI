using EduSubmit.Application.Common.Interfaces;
using EduSubmit.Application.Users.Commands;
using EduSubmit.Application.Users.DTOs;
using EduSubmit.Application.Users.Reader;
using EduSubmit.Domain.Common;
using MediatR;

namespace EduSubmit.Application.Users.Handlers;

public sealed class LoginCommandHandler
    : IRequestHandler<LoginCommand, Result<LoginResponse>>
{
    private readonly IUserReader _userReader;
    private readonly IJwtService _jwtService;
    private readonly IPasswordHasher _passwordHasher;

    public LoginCommandHandler(
        IUserReader userReader,
        IJwtService jwtService,
        IPasswordHasher passwordHasher)
    {
        _userReader = userReader;
        _jwtService = jwtService;
        _passwordHasher = passwordHasher;
    }

    public async Task<Result<LoginResponse>> Handle(
        LoginCommand request,
        CancellationToken cancellationToken)
    {
        var user = await _userReader.GetByEmailAsync(
            request.Email,
            cancellationToken);

        if (user is null)
        {
            return Result<LoginResponse>.Failure(
                "Invalid email or password.");
        }

        var passwordValid = _passwordHasher.Verify(
            request.Password,
            user.PasswordHash);

        if (!passwordValid)
        {
            return Result<LoginResponse>.Failure(
                "Invalid email or password.");
        }

        var token = _jwtService.GenerateToken(
            user.Id,
            user.Email.Value,
            user.Role.ToString());

        var response = new LoginResponse(
            token,
            user.Id,
            user.Email.Value,
            user.Role.ToString());

        return Result<LoginResponse>.Success(response);
    }
}