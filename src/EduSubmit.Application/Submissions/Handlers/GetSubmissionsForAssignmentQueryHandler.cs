using EduSubmit.Application.Common.Interfaces;
using EduSubmit.Application.Common.Models;
using EduSubmit.Application.Submissions.Dtos;
using EduSubmit.Application.Submissions.Queries;
using EduSubmit.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSubmit.Application.Submissions.Handlers;

public sealed class GetSubmissionsForAssignmentQueryHandler
    : IRequestHandler<GetSubmissionsForAssignmentQuery, Result<PaginatedList<SubmissionListDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetSubmissionsForAssignmentQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<PaginatedList<SubmissionListDto>>> Handle(
        GetSubmissionsForAssignmentQuery request,
        CancellationToken cancellationToken)
    {
        var teacherId = _currentUserService.UserId;

        if (!teacherId.HasValue || teacherId.Value == Guid.Empty)
            return Result<PaginatedList<SubmissionListDto>>.Failure(
                "Authenticated user was not found.");

        var assignmentExists = await _context.Assignments
            .AsNoTracking()
            .AnyAsync(
                x => x.Id == request.AssignmentId &&
                     x.TeacherId == teacherId.Value,
                cancellationToken);

        if (!assignmentExists)
            return Result<PaginatedList<SubmissionListDto>>.Failure(
                "Assignment was not found.");

        var query = _context.Submissions
            .AsNoTracking()
            .Where(x => x.AssignmentId == request.AssignmentId);

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