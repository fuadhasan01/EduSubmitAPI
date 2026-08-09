using EduSubmit.Application.Classes.Commands;
using EduSubmit.Application.Classes.DTOs;
using EduSubmit.Application.Common.Interfaces;
using EduSubmit.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSubmit.Application.Classes.Handlers;

public sealed class CreateClassCommandHandler
    : IRequestHandler<CreateClassCommand, Result<ClassResponse>>
{
    private readonly IApplicationDbContext _context;

    public CreateClassCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ClassResponse>> Handle(
        CreateClassCommand request,
        CancellationToken cancellationToken)
    {
        var exists = await _context.Classes
            .AnyAsync(
                x => x.Name == request.Name.Trim(),
                cancellationToken);

        if (exists)
            return Result<ClassResponse>.Failure(
                "A class with this name already exists.");

        var classResult = Domain.Entities.Class.Create(request.Name);

        if (classResult.IsFailure)
            return Result<ClassResponse>.Failure(classResult.Error!);

        var entity = classResult.Value!;

        _context.Classes.Add(entity);

        await _context.SaveChangesAsync(cancellationToken);

        var response = new ClassResponse(
            entity.Id,
            entity.Name);

        return Result<ClassResponse>.Success(response);
    }
}