using EduSubmit.Application.Common.Interfaces;
using EduSubmit.Application.Submissions.Commands;
using EduSubmit.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSubmit.Application.Submissions.Handlers;

public sealed class GradeSubmissionCommandHandler
    : IRequestHandler<GradeSubmissionCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GradeSubmissionCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(
        GradeSubmissionCommand request,
        CancellationToken cancellationToken)
    {
        var teacherId = _currentUserService.UserId;

        if (!teacherId.HasValue || teacherId.Value == Guid.Empty)
            return Result.Failure("Authenticated user was not found.");

        var submission = await _context.Submissions
            .FirstOrDefaultAsync(
                x => x.Id == request.SubmissionId,
                cancellationToken);

        if (submission is null)
            return Result.Failure("Submission was not found.");

        var assignment = await _context.Assignments
            .AsNoTracking()
            .Where(x => x.Id == submission.AssignmentId)
            .Select(x => new
            {
                x.TeacherId,
                x.MaxMarks
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (assignment is null)
            return Result.Failure("Assignment was not found.");

        if (assignment.TeacherId != teacherId.Value)
            return Result.Failure(
                "You are not authorized to grade this submission.");

        var gradeResult = submission.Grade(
            request.Marks,
            request.Feedback,
            assignment.MaxMarks);

        if (gradeResult.IsFailure)
            return Result.Failure(gradeResult.Error!);

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}