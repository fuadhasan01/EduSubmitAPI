using EduSubmit.Application.Classes.DTOs;
using EduSubmit.Application.Classes.Queries;
using EduSubmit.Application.Common.Interfaces;
using EduSubmit.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSubmit.Application.Classes.Handlers;

public sealed class GetTeachersByClassQueryHandler
    : IRequestHandler<GetTeachersByClassQuery, Result<IReadOnlyList<TeacherAssignmentResponse>>>
{
    private readonly IApplicationDbContext _context;

    public GetTeachersByClassQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<TeacherAssignmentResponse>>> Handle(
        GetTeachersByClassQuery request,
        CancellationToken cancellationToken)
    {
        var classExists = await _context.Classes
            .AsNoTracking()
            .AnyAsync(x => x.Id == request.ClassId, cancellationToken);

        if (!classExists)
            return Result<IReadOnlyList<TeacherAssignmentResponse>>.Failure("Class was not found.");

        var assignments = await _context.TeacherSubjectAssignments
            .AsNoTracking()
            .Where(x => _context.Subjects.Any(s => s.Id == x.SubjectId && s.ClassId == request.ClassId))
            .Join(
                _context.Subjects.AsNoTracking(),
                assignment => assignment.SubjectId,
                subject => subject.Id,
                (assignment, subject) => new { assignment, subject })
            .Join(
                _context.Users.AsNoTracking(),
                x => x.assignment.TeacherId,
                teacher => teacher.Id,
                (x, teacher) => new TeacherAssignmentResponse(
                    x.subject.Id,
                    x.subject.Name,
                    teacher.Id,
                    teacher.FullName))
            .OrderBy(x => x.SubjectName)
            .ThenBy(x => x.TeacherName)
            .ToListAsync(cancellationToken);

        return Result<IReadOnlyList<TeacherAssignmentResponse>>.Success(assignments);
    }
}
