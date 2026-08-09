using EduSubmit.Application.Classes.DTOs;
using EduSubmit.Application.Classes.Queries;
using EduSubmit.Application.Common.Interfaces;
using EduSubmit.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSubmit.Application.Classes.Handlers;

public sealed class GetClassesQueryHandler
    : IRequestHandler<GetClassesQuery, Result<IReadOnlyList<ClassResponse>>>
{
    private readonly IApplicationDbContext _context;

    public GetClassesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<ClassResponse>>> Handle(
        GetClassesQuery request,
        CancellationToken cancellationToken)
    {
        var classes = await _context.Classes
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .Select(x => new ClassResponse(
                x.Id,
                x.Name))
            .ToListAsync(cancellationToken);

        return Result<IReadOnlyList<ClassResponse>>.Success(classes);
    }
}