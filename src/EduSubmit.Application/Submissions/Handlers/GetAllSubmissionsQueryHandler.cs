using EduSubmit.Application.Common.Interfaces;
using EduSubmit.Application.Common.Models;
using EduSubmit.Application.Submissions.Dtos;
using EduSubmit.Application.Submissions.Queries;
using EduSubmit.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSubmit.Application.Submissions.Handlers;

public sealed class GetAllSubmissionsQueryHandler
    : IRequestHandler<GetAllSubmissionsQuery, Result<PaginatedList<SubmissionListDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetAllSubmissionsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PaginatedList<SubmissionListDto>>> Handle(
        GetAllSubmissionsQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.Submissions
            .AsNoTracking();

        var totalCount = await query.CountAsync(cancellationToken);

        var submissions = await query
            .OrderByDescending(x => x.SubmittedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(x => new SubmissionListDto(
                x.Id,
                x.AssignmentId,
                x.StudentId,
                x.Content,
                x.FileUrl,
                x.SubmittedAt,
                x.Status.ToString(),
                x.Marks,
                x.Feedback,
                x.GradedAt))
            .ToListAsync(cancellationToken);

        var result = new PaginatedList<SubmissionListDto>(
            submissions,
            totalCount,
            request.PageNumber,
            request.PageSize);

        return Result<PaginatedList<SubmissionListDto>>.Success(result);
    }
}