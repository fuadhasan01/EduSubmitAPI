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

        var enrollments = await _context.StudentClassEnrollments
            .AsNoTracking()
            .Where(x => x.ClassId == request.ClassId)
            .Join(
                _context.Users.AsNoTracking(),
                enrollment => enrollment.StudentId,
                student => student.Id,
                (enrollment, student) => new StudentEnrollmentResponse(
                    student.Id,
                    student.FullName,
                    enrollment.ClassId))
            .OrderBy(x => x.StudentName)
            .ToListAsync(cancellationToken);

        return Result<IReadOnlyList<StudentEnrollmentResponse>>.Success(enrollments);
    }
}
