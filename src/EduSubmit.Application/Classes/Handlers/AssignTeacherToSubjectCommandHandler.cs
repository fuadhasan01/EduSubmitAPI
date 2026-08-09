using EduSubmit.Application.Classes.Commands;
using EduSubmit.Application.Common.Interfaces;
using EduSubmit.Domain.Common;
using EduSubmit.Domain.Entities;
using EduSubmit.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSubmit.Application.Classes.Handlers;

public sealed class AssignTeacherToSubjectCommandHandler
    : IRequestHandler<AssignTeacherToSubjectCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public AssignTeacherToSubjectCommandHandler(
        IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(
        AssignTeacherToSubjectCommand request,
        CancellationToken cancellationToken)
    {
        var teacherExists = await _context.Users
            .AsNoTracking()
            .AnyAsync(
                x => x.Id == request.TeacherId &&
                     x.Role == EnumUserRole.Teacher,
                cancellationToken);

        if (!teacherExists)
            return Result.Failure(
                "Teacher was not found.");

        var subjectExists = await _context.Subjects
            .AsNoTracking()
            .AnyAsync(
                x => x.Id == request.SubjectId,
                cancellationToken);

        if (!subjectExists)
            return Result.Failure(
                "Subject was not found.");

        var alreadyAssigned = await _context.TeacherSubjectAssignments
            .AnyAsync(
                x => x.TeacherId == request.TeacherId &&
                     x.SubjectId == request.SubjectId,
                cancellationToken);

        if (alreadyAssigned)
            return Result.Failure(
                "Teacher is already assigned to this subject.");

        var assignmentResult = TeacherSubjectAssignment.Create(
            request.TeacherId,
            request.SubjectId);

        if (assignmentResult.IsFailure)
            return Result.Failure(
                assignmentResult.Error!);

        _context.TeacherSubjectAssignments.Add(
            assignmentResult.Value!);

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}