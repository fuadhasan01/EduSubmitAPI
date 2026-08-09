using EduSubmit.Application.Common.Models;
using EduSubmit.Application.Users.DTOs;
using EduSubmit.Domain.Common;
using MediatR;

namespace EduSubmit.Application.Users.Queries;

public sealed record GetUsersQuery(int PageNumber = 1, int PageSize = 10) : IRequest<Result<PaginatedList<UserResponse>>>;