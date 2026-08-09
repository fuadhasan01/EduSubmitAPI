using EduSubmit.Application.Common.Models;
using EduSubmit.Application.Users.DTOs;
using EduSubmit.Application.Users.Queries;
using EduSubmit.Application.Users.Reader;
using EduSubmit.Domain.Common;
using EduSubmit.Domain.Entities;
using MediatR;

namespace EduSubmit.Application.Users.Handlers;

public sealed class GetUsersQueryHandler
    : IRequestHandler<GetUsersQuery, Result<PaginatedList<UserResponse>>>
{
    private readonly IUserReader _userReader;

    public GetUsersQueryHandler(IUserReader userReader)
    {
        _userReader = userReader;
    }

    public async Task<Result<PaginatedList<UserResponse>>> Handle(
        GetUsersQuery request,
        CancellationToken cancellationToken)
    {
        var users = await _userReader.GetUsersAsync(
            request.PageNumber,
            request.PageSize,
            cancellationToken);

        var items = users.Items
            .Select(MapToResponse)
            .ToList();

        var response = new PaginatedList<UserResponse>(
            items,
            users.TotalCount,
            users.PageNumber,
            users.PageSize);

        return Result<PaginatedList<UserResponse>>.Success(
            response);
    }

    private static UserResponse MapToResponse(User user)
    {
        return new UserResponse(
            user.Id,
            user.FullName,
            user.Email.Value,
            user.Role,
            user.CreatedAt);
    }
}