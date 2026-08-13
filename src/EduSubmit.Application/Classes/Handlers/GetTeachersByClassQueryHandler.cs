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

        var assignments = await (
                from assignment in _context.TeacherSubjectAssignments.AsNoTracking()
                join subject in _context.Subjects.AsNoTracking() on assignment.SubjectId equals subject.Id
                join teacher in _context.Users.AsNoTracking() on assignment.TeacherId equals teacher.Id
                where subject.ClassId == request.ClassId
                orderby subject.Name, teacher.FullName
                select new TeacherAssignmentResponse(
                    subject.Id,
                    subject.Name,
                    teacher.Id,
                    teacher.FullName))
            .ToListAsync(cancellationToken);

        return Result<IReadOnlyList<TeacherAssignmentResponse>>.Success(assignments);
    }
}
