using EduSubmit.Application.Common.Interfaces;
using EduSubmit.Application.Common.Models;
using EduSubmit.Application.Submissions.Dtos;
using EduSubmit.Application.Submissions.Queries;
using EduSubmit.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSubmit.Application.Submissions.Handlers;

public sealed class GetSubmissionsForStudentQueryHandler
    : IRequestHandler<GetSubmissionsForStudentQuery, Result<PaginatedList<SubmissionListDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetSubmissionsForStudentQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<PaginatedList<SubmissionListDto>>> Handle(
        GetSubmissionsForStudentQuery request,
        CancellationToken cancellationToken)
    {
        var studentId = _currentUserService.UserId;

        if (!studentId.HasValue || studentId.Value == Guid.Empty)
            return Result<PaginatedList<SubmissionListDto>>.Failure(
                "Authenticated user was not found.");

        var query = _context.Submissions
            .AsNoTracking()
            .Where(x => x.StudentId == studentId.Value);

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