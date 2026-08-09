using EduSubmit.Application.Common.Interfaces;
using EduSubmit.Application.Subjects.DTOs;
using EduSubmit.Application.Subjects.Queries;
using EduSubmit.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSubmit.Application.Subjects.Handlers;

public sealed class GetSubjectsByClassQueryHandler
    : IRequestHandler<GetSubjectsByClassQuery, Result<IReadOnlyList<SubjectResponse>>>
{
    private readonly IApplicationDbContext _context;

    public GetSubjectsByClassQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<SubjectResponse>>> Handle(
        GetSubjectsByClassQuery request,
        CancellationToken cancellationToken)
    {
        var classExists = await _context.Classes
            .AsNoTracking()
            .AnyAsync(
                x => x.Id == request.ClassId,
                cancellationToken);

        if (!classExists)
            return Result<IReadOnlyList<SubjectResponse>>.Failure(
                "Class was not found.");

        var subjects = await _context.Subjects
            .AsNoTracking()
            .Where(x => x.ClassId == request.ClassId)
            .OrderBy(x => x.Name)
            .Select(x => new SubjectResponse(
                x.Id,
                x.Name,
                x.ClassId))
            .ToListAsync(cancellationToken);

        return Result<IReadOnlyList<SubjectResponse>>.Success(subjects);
    }
}