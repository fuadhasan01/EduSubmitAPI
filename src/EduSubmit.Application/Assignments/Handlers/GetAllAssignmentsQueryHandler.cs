using EduSubmit.Application.Assignments.Dtos;
using EduSubmit.Application.Assignments.Queries;
using EduSubmit.Application.Common.Interfaces;
using EduSubmit.Application.Common.Models;
using EduSubmit.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSubmit.Application.Assignments.Handlers;

public sealed class GetAllAssignmentsQueryHandler
    : IRequestHandler<GetAllAssignmentsQuery, Result<PaginatedList<AssignmentListDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetAllAssignmentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PaginatedList<AssignmentListDto>>> Handle(
        GetAllAssignmentsQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.Assignments
            .AsNoTracking();

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