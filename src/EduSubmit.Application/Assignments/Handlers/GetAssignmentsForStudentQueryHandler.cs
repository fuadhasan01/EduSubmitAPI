using EduSubmit.Application.Assignments.Dtos;
using EduSubmit.Application.Assignments.Queries;
using EduSubmit.Application.Common.Interfaces;
using EduSubmit.Application.Common.Models;
using EduSubmit.Domain.Common;
using EduSubmit.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSubmit.Application.Assignments.Handlers;

public sealed class GetAssignmentsForStudentQueryHandler
    : IRequestHandler<GetAssignmentsForStudentQuery, Result<PaginatedList<AssignmentListDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetAssignmentsForStudentQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<PaginatedList<AssignmentListDto>>> Handle(
        GetAssignmentsForStudentQuery request,
        CancellationToken cancellationToken)
    {
        var studentId = _currentUserService.UserId;

        if (studentId == Guid.Empty)
            return Result<PaginatedList<AssignmentListDto>>.Failure("Authenticated user was not found.");

        var query = _context.Assignments
            .AsNoTracking()
            .Where(x =>
                x.Status == EnumAssignmentStatus.Published &&
                _context.StudentClassEnrollments.Any(e =>
                    e.StudentId == studentId &&
                    e.ClassId == x.ClassId));

        var totalCount = await query.CountAsync(cancellationToken);

        var assignments = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(x => new AssignmentListDto(
                x.Id,
                x.Title,
                x.Description,
                x.SubjectId,
                x.ClassId,
                x.TeacherId,
                x.Deadline,
                x.MaxMarks,
                x.Status.ToString(),
                x.CreatedAt,
                _context.Subjects
                    .Where(s => s.Id == x.SubjectId)
                    .Select(s => s.Name)
                    .FirstOrDefault(),
                _context.Classes
                    .Where(c => c.Id == x.ClassId)
                    .Select(c => c.Name)
                    .FirstOrDefault(),
                _context.Users
                    .Where(u => u.Id == x.TeacherId)
                    .Select(u => u.FullName)
                    .FirstOrDefault()))
            .ToListAsync(cancellationToken);

        var result = new PaginatedList<AssignmentListDto>(
            assignments,
            totalCount,
            request.PageNumber,
            request.PageSize);

        return Result<PaginatedList<AssignmentListDto>>.Success(result);
    }
}