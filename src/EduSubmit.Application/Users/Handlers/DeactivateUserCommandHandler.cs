using EduSubmit.Application.Common.Interfaces;
using EduSubmit.Application.Users.Commands;
using EduSubmit.Application.Users.Reader;
using EduSubmit.Application.Users.Writer;
using EduSubmit.Domain.Common;
using MediatR;

namespace EduSubmit.Application.Users.Handlers;

public sealed class DeactivateUserCommandHandler
    : IRequestHandler<DeactivateUserCommand, Result>
{
    private readonly IUserReader _userReader;
    private readonly IUserWriter _userWriter;
    private readonly IApplicationDbContext _dbContext;

    public DeactivateUserCommandHandler(
        IUserReader userReader,
        IUserWriter userWriter,
        IApplicationDbContext dbContext)
    {
        _userReader = userReader;
        _userWriter = userWriter;
        _dbContext = dbContext;
    }

    public async Task<Result> Handle(
        DeactivateUserCommand request,
        CancellationToken cancellationToken)
    {
        var user = await _dbContext.Users.FindAsync(new object[] { request.UserId }, cancellationToken);

        if (user is null)
            return Result.Failure("User not found.");

        var deactivateResult = user.Deactivate();

        if (deactivateResult.IsFailure)
            return deactivateResult;

        await _userWriter.SaveChangesAsync(
            cancellationToken);

        return Result.Success();
    }
}