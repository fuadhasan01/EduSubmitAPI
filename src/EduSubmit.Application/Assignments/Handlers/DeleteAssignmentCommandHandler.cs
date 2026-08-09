using EduSubmit.Application.Assignments.Commands;
using EduSubmit.Application.Common.Interfaces;
using EduSubmit.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSubmit.Application.Assignments.Handlers;

public sealed class DeleteAssignmentCommandHandler : IRequestHandler<DeleteAssignmentCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public DeleteAssignmentCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(
        DeleteAssignmentCommand request,
        CancellationToken cancellationToken)
    {
        var assignment = await _context.Assignments
            .FirstOrDefaultAsync(
                x => x.Id == request.AssignmentId,
                cancellationToken);

        if (assignment is null)
            return Result.Failure("Assignment was not found.");

        if (assignment.TeacherId != _currentUserService.UserId)
            return Result.Failure("You are not allowed to delete this assignment.");

        _context.Assignments.Remove(assignment);

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}