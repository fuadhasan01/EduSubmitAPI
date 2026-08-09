using EduSubmit.Application.Common.Interfaces;
using EduSubmit.Application.Submissions.Dtos;
using EduSubmit.Application.Submissions.Queries;
using EduSubmit.Domain.Common;
using EduSubmit.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSubmit.Application.Submissions.Handlers;

public sealed class GetSubmissionByIdQueryHandler
    : IRequestHandler<GetSubmissionByIdQuery, Result<SubmissionDetailsDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetSubmissionByIdQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<SubmissionDetailsDto>> Handle(
        GetSubmissionByIdQuery request,
        CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;

        if (!userId.HasValue || userId.Value == Guid.Empty)
            return Result<SubmissionDetailsDto>.Failure(
                "Authenticated user was not found.");

        var submission = await _context.Submissions
            .AsNoTracking()
            .Where(x => x.Id == request.SubmissionId)
            .Select(x => new
            {
                Submission = x,
                AssignmentTeacherId = _context.Assignments
                    .Where(a => a.Id == x.AssignmentId)
                    .Select(a => a.TeacherId)
                    .FirstOrDefault()
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (submission is null)
            return Result<SubmissionDetailsDto>.Failure(
                "Submission was not found.");

        var isAdmin = _currentUserService.Role == EnumUserRole.Admin;
        var isStudentOwner =
            submission.Submission.StudentId == userId.Value;

        var isAssignmentTeacher =
            submission.AssignmentTeacherId == userId.Value;

        if (!isAdmin && !isStudentOwner && !isAssignmentTeacher)
            return Result<SubmissionDetailsDto>.Failure(
                "You are not authorized to view this submission.");

        var entity = submission.Submission;

        var dto = new SubmissionDetailsDto(
            entity.Id,
            entity.AssignmentId,
            entity.StudentId,
            entity.Content,
            entity.FileUrl,
            entity.SubmittedAt,
            entity.Status.ToString(),
            entity.Marks,
            entity.Feedback,
            entity.GradedAt);

        return Result<SubmissionDetailsDto>.Success(dto);
    }
}