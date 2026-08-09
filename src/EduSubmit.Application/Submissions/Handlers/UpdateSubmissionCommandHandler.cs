using EduSubmit.Application.Common.Interfaces;
using EduSubmit.Application.Submissions.Commands;
using EduSubmit.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSubmit.Application.Submissions.Handlers;

public sealed class UpdateSubmissionCommandHandler
    : IRequestHandler<UpdateSubmissionCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdateSubmissionCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(
        UpdateSubmissionCommand request,
        CancellationToken cancellationToken)
    {
        var studentId = _currentUserService.UserId;

        if (!studentId.HasValue || studentId.Value == Guid.Empty)
            return Result.Failure("Authenticated user was not found.");

        var submission = await _context.Submissions
            .FirstOrDefaultAsync(
                x => x.Id == request.SubmissionId &&
                     x.StudentId == studentId.Value,
                cancellationToken);

        if (submission is null)
            return Result.Failure("Submission was not found.");

        var assignment = await _context.Assignments
            .AsNoTracking()
            .Where(x => x.Id == submission.AssignmentId)
            .Select(x => new
            {
                x.Deadline,
                x.Status
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (assignment is null)
            return Result.Failure("Assignment was not found.");

        if (assignment.Status != Domain.Enums.EnumAssignmentStatus.Published)
            return Result.Failure("Only published assignments can be updated.");

        var updateResult = submission.Update(
            request.Content,
            request.FileUrl,
            assignment.Deadline);

        if (updateResult.IsFailure)
            return Result.Failure(updateResult.Error!);

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}