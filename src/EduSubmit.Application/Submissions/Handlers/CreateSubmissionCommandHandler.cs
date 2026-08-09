using EduSubmit.Application.Common.Interfaces;
using EduSubmit.Application.Submissions.Commands;
using EduSubmit.Domain.Common;
using EduSubmit.Domain.Entities;
using EduSubmit.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSubmit.Application.Submissions.Handlers;

public sealed class CreateSubmissionCommandHandler
    : IRequestHandler<CreateSubmissionCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public CreateSubmissionCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<Guid>> Handle(
        CreateSubmissionCommand request,
        CancellationToken cancellationToken)
    {
        var studentId = _currentUserService.UserId;

        if (!studentId.HasValue || studentId.Value == Guid.Empty)
            return Result<Guid>.Failure("Authenticated user was not found.");

        var assignment = await _context.Assignments
            .AsNoTracking()
            .Where(x => x.Id == request.AssignmentId)
            .Select(x => new
            {
                x.Id,
                x.ClassId,
                x.Deadline,
                x.Status
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (assignment is null)
            return Result<Guid>.Failure("Assignment was not found.");

        if (assignment.Status != EnumAssignmentStatus.Published)
            return Result<Guid>.Failure("Only published assignments can be submitted.");

        var isEnrolled = await _context.StudentClassEnrollments
            .AsNoTracking()
            .AnyAsync(
                x => x.StudentId == studentId.Value && x.ClassId == assignment.ClassId,
                cancellationToken);

        if (!isEnrolled)
            return Result<Guid>.Failure(
                "You are not enrolled in the class for this assignment.");

        var existingSubmission = await _context.Submissions
            .AsNoTracking()
            .AnyAsync(
                x => x.AssignmentId == request.AssignmentId &&
                     x.StudentId == studentId.Value,
                cancellationToken);

        if (existingSubmission)
            return Result<Guid>.Failure(
                "You have already submitted this assignment.");

        var submissionResult = Submission.Create(
            request.AssignmentId,
            studentId.Value,
            request.Content,
            request.FileUrl,
            assignment.Deadline);

        if (submissionResult.IsFailure)
            return Result<Guid>.Failure(submissionResult.Error!);

        var submission = submissionResult.Value!;

        _context.Submissions.Add(submission);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(submission.Id);
    }
}