using EduSubmit.Application.Assignments.Dtos;
using EduSubmit.Application.Assignments.Queries;
using EduSubmit.Application.Common.Interfaces;
using EduSubmit.Domain.Common;
using EduSubmit.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSubmit.Application.Assignments.Handlers;

public sealed class GetAssignmentByIdQueryHandler
    : IRequestHandler<GetAssignmentByIdQuery, Result<AssignmentListDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetAssignmentByIdQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<AssignmentListDto>> Handle(
        GetAssignmentByIdQuery request,
        CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;

        if (!userId.HasValue || userId.Value == Guid.Empty)
            return Result<AssignmentListDto>.Failure(
                "Authenticated user was not found.");

        var userRole = _currentUserService.Role;

        var assignment = await _context.Assignments
            .AsNoTracking()
            .Where(x => x.Id == request.Id)
            .Select(x => new
            {
                Assignment = x,
                IsTeacher = x.TeacherId == userId,
                IsStudent = _context.StudentClassEnrollments.Any(e =>
                    e.StudentId == userId &&
                    e.ClassId == x.ClassId)
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (assignment is null)
            return Result<AssignmentListDto>.Failure("Assignment not found.");

        var canView = userRole switch
        {
            EnumUserRole.Admin => true,

            EnumUserRole.Teacher =>
                assignment.IsTeacher,

            EnumUserRole.Student =>
                assignment.IsStudent &&
                assignment.Assignment.Status == EnumAssignmentStatus.Published,

            _ => false
        };

        if (!canView)
            return Result<AssignmentListDto>.Failure("You are not authorized to view this assignment.");

        var x = assignment.Assignment;

        return Result<AssignmentListDto>.Success(
            new AssignmentListDto(
                x.Id,
                x.Title,
                x.Description,
                x.SubjectId,
                x.ClassId,
                x.TeacherId,
                x.Deadline,
                x.MaxMarks,
                x.Status.ToString(),
                x.CreatedAt));
    }
}