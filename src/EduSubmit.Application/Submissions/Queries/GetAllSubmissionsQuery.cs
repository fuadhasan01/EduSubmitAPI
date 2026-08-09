using EduSubmit.Application.Common.Models;
using EduSubmit.Application.Submissions.Dtos;
using EduSubmit.Domain.Common;
using MediatR;

namespace EduSubmit.Application.Submissions.Queries;

public sealed record GetAllSubmissionsQuery(
    int PageNumber = 1,
    int PageSize = 10) : IRequest<Result<PaginatedList<SubmissionListDto>>>;