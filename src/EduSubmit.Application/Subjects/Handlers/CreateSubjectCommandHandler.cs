using EduSubmit.Application.Common.Interfaces;
using EduSubmit.Application.Subjects.Commands;
using EduSubmit.Application.Subjects.DTOs;
using EduSubmit.Domain.Common;
using EduSubmit.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSubmit.Application.Subjects.Handlers;

public sealed class CreateSubjectCommandHandler
    : IRequestHandler<CreateSubjectCommand, Result<SubjectResponse>>
{
    private readonly IApplicationDbContext _context;

    public CreateSubjectCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<SubjectResponse>> Handle(
        CreateSubjectCommand request,
        CancellationToken cancellationToken)
    {
        var classExists = await _context.Classes
            .AnyAsync(
                x => x.Id == request.ClassId,
                cancellationToken);

        if (!classExists)
            return Result<SubjectResponse>.Failure(
                "Class was not found.");

        var subjectResult = Subject.Create(
            request.Name,
            request.ClassId);

        if (subjectResult.IsFailure)
            return Result<SubjectResponse>.Failure(
                subjectResult.Error!);

        var subject = subjectResult.Value!;

        _context.Subjects.Add(subject);

        await _context.SaveChangesAsync(cancellationToken);

        var response = new SubjectResponse(
            subject.Id,
            subject.Name,
            subject.ClassId);

        return Result<SubjectResponse>.Success(response);
    }
}