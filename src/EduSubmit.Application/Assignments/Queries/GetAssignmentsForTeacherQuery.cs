using EduSubmit.Application.Common.Models;
using EduSubmit.Application.Assignments.Dtos;
using MediatR;
using EduSubmit.Domain.Common;

namespace EduSubmit.Application.Assignments.Queries;

public sealed record GetAssignmentsForTeacherQuery(
    int PageNumber = 1,
    int PageSize = 10) : IRequest<Result<PaginatedList<AssignmentListDto>>>;