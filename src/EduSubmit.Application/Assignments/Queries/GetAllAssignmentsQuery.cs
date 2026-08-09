using EduSubmit.Application.Assignments.Dtos;
using EduSubmit.Application.Common.Models;
using EduSubmit.Domain.Common;
using MediatR;

namespace EduSubmit.Application.Assignments.Queries;

public sealed record GetAllAssignmentsQuery(
    int PageNumber = 1,
    int PageSize = 10)
    : IRequest<Result<PaginatedList<AssignmentListDto>>>;