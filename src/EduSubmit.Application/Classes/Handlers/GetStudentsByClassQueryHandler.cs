using EduSubmit.Application.Classes.DTOs;
using EduSubmit.Application.Classes.Queries;
using EduSubmit.Application.Common.Interfaces;
using EduSubmit.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSubmit.Application.Classes.Handlers;

public sealed class GetStudentsByClassQueryHandler
    : IRequestHandler<GetStudentsByClassQuery, Result<IReadOnlyList<StudentEnrollmentResponse>>>
{
    private readonly IApplicationDbContext _context;

    public GetStudentsByClassQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<StudentEnrollmentResponse>>> Handle(
        GetStudentsByClassQuery request,
        CancellationToken cancellationToken)
    {
        var classExists = await _context.Classes
            .AsNoTracking()
            .AnyAsync(x => x.Id == request.ClassId, cancellationToken);

        if (!classExists)
            return Result<IReadOnlyList<StudentEnrollmentResponse>>.Failure("Class was not found.");

        var enrollments = await (
                from enrollment in _context.StudentClassEnrollments.AsNoTracking()
                join student in _context.Users.AsNoTracking() on enrollment.StudentId equals student.Id
                where enrollment.ClassId == request.ClassId
                orderby student.FullName
                select new StudentEnrollmentResponse(
                    student.Id,
                    student.FullName,
                    enrollment.ClassId))
            .ToListAsync(cancellationToken);

        return Result<IReadOnlyList<StudentEnrollmentResponse>>.Success(enrollments);
    }
}
