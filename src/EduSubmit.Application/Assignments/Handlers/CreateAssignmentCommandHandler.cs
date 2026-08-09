using EduSubmit.Application.Assignments.Commands;
using EduSubmit.Application.Common.Interfaces;
using EduSubmit.Domain.Common;
using EduSubmit.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSubmit.Application.Assignments.Handlers;

public sealed class CreateAssignmentCommandHandler : IRequestHandler<CreateAssignmentCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public CreateAssignmentCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<Guid>> Handle(
    CreateAssignmentCommand request,
    CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;

        if (!userId.HasValue || userId.Value == Guid.Empty)
            return Result<Guid>.Failure("Authenticated user was not found.");

        var subjectExists = await _context.Subjects
            .AsNoTracking()
            .AnyAsync(x => x.Id == request.SubjectId, cancellationToken);

        if (!subjectExists)
            return Result<Guid>.Failure("Subject was not found.");

        var classExists = await _context.Classes
            .AsNoTracking()
            .AnyAsync(x => x.Id == request.ClassId, cancellationToken);

        if (!classExists)
            return Result<Guid>.Failure("Class was not found.");

        var assignmentResult = Assignment.Create(
            request.Title,
            request.Description,
            request.SubjectId,
            request.ClassId,
            userId.Value,
            request.Deadline,
            request.MaxMarks);

        if (assignmentResult.IsFailure)
            return Result<Guid>.Failure(assignmentResult.Error!);

        var assignment = assignmentResult.Value!;

        if (request.PublishImmediately)
        {
            var publishResult = assignment.Publish();

            if (publishResult.IsFailure)
                return Result<Guid>.Failure(publishResult.Error!);
        }

        _context.Assignments.Add(assignment);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(assignment.Id);
    }
}