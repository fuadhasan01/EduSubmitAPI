using EduSubmit.Application.Common.Interfaces;
using EduSubmit.Application.Submissions.Commands;
using EduSubmit.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSubmit.Application.Submissions.Handlers;

public sealed class ReturnSubmissionForRevisionCommandHandler
    : IRequestHandler<ReturnSubmissionForRevisionCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public ReturnSubmissionForRevisionCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(
        ReturnSubmissionForRevisionCommand request,
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

        var assignmentTeacherId = await _context.Assignments
            .AsNoTracking()
            .Where(x => x.Id == submission.AssignmentId)
            .Select(x => x.TeacherId)
            .FirstOrDefaultAsync(cancellationToken);

        if (assignmentTeacherId == Guid.Empty)
            return Result.Failure("Assignment was not found.");

        if (assignmentTeacherId != teacherId.Value)
            return Result.Failure(
                "You are not authorized to return this submission for revision.");

        var returnResult = submission.ReturnForRevision(request.Feedback);

        if (returnResult.IsFailure)
            return Result.Failure(returnResult.Error!);

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}