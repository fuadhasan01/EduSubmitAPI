using EduSubmit.Application.Assignments.Commands;
using EduSubmit.Application.Common.Interfaces;
using EduSubmit.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSubmit.Application.Assignments.Handlers;

public sealed class UpdateAssignmentCommandHandler : IRequestHandler<UpdateAssignmentCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdateAssignmentCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(
        UpdateAssignmentCommand request,
        CancellationToken cancellationToken)
    {
        var assignment = await _context.Assignments
            .FirstOrDefaultAsync(
                x => x.Id == request.AssignmentId,
                cancellationToken);

        if (assignment is null)
            return Result.Failure("Assignment was not found.");

        if (assignment.TeacherId != _currentUserService.UserId)
            return Result.Failure("You are not allowed to modify this assignment.");

        var subjectExists = await _context.Subjects
            .AsNoTracking()
            .AnyAsync(x => x.Id == request.SubjectId, cancellationToken);

        if (!subjectExists)
            return Result.Failure("Subject was not found.");

        var classExists = await _context.Classes
            .AsNoTracking()
            .AnyAsync(x => x.Id == request.ClassId, cancellationToken);

        if (!classExists)
            return Result.Failure("Class was not found.");

        var result = assignment.Update(
            request.Title,
            request.Description,
            request.SubjectId,
            request.ClassId,
            request.Deadline,
            request.MaxMarks,
            DateTime.UtcNow);

        if (result.IsFailure)
            return result;

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}