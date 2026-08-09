using EduSubmit.Application.Classes.Commands;
using EduSubmit.Application.Common.Interfaces;
using EduSubmit.Domain.Common;
using EduSubmit.Domain.Entities;
using EduSubmit.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSubmit.Application.Classes.Handlers;

public sealed class EnrollStudentToClassCommandHandler
    : IRequestHandler<EnrollStudentToClassCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public EnrollStudentToClassCommandHandler(
        IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(
        EnrollStudentToClassCommand request,
        CancellationToken cancellationToken)
    {
        var studentExists = await _context.Users
            .AsNoTracking()
            .AnyAsync(
                x => x.Id == request.StudentId &&
                     x.Role == EnumUserRole.Student,
                cancellationToken);

        if (!studentExists)
            return Result.Failure(
                "Student was not found.");

        var classExists = await _context.Classes
            .AsNoTracking()
            .AnyAsync(
                x => x.Id == request.ClassId,
                cancellationToken);

        if (!classExists)
            return Result.Failure(
                "Class was not found.");

        var alreadyEnrolled = await _context.StudentClassEnrollments
            .AnyAsync(
                x => x.StudentId == request.StudentId &&
                     x.ClassId == request.ClassId,
                cancellationToken);

        if (alreadyEnrolled)
            return Result.Failure(
                "Student is already enrolled in this class.");

        var enrollmentResult = StudentClassEnrollment.Create(
            request.StudentId,
            request.ClassId);

        if (enrollmentResult.IsFailure)
            return Result.Failure(
                enrollmentResult.Error!);

        _context.StudentClassEnrollments.Add(
            enrollmentResult.Value!);

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}