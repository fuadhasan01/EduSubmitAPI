using EduSubmit.Application.Assignments.Dtos;
using EduSubmit.Application.Assignments.Queries;
using EduSubmit.Application.Common.Interfaces;
using EduSubmit.Application.Common.Models;
using EduSubmit.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSubmit.Application.Assignments.Handlers;

public sealed class GetAssignmentsForTeacherQueryHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUserService)
    : IRequestHandler<GetAssignmentsForTeacherQuery, Result<PaginatedList<AssignmentListDto>>>
{
    public async Task<Result<PaginatedList<AssignmentListDto>>> Handle(
        GetAssignmentsForTeacherQuery request,
        CancellationToken cancellationToken)
    {
        if (currentUserService.UserId is null)
            return Result<PaginatedList<AssignmentListDto>>.Failure(
                "User is not authenticated.");

        var query = context.Assignments
            .AsNoTracking()
            .Where(x => x.TeacherId == currentUserService.UserId.Value)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new AssignmentListDto(
                x.Id,
                x.Title,
                x.Description,
                x.SubjectId,
                x.ClassId,
                x.TeacherId,
                x.Deadline,
                x.MaxMarks,
                x.Status.ToString(),
                x.CreatedAt));

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var paginatedList = new PaginatedList<AssignmentListDto>(
            items,
            totalCount,
            request.PageNumber,
            request.PageSize);

        return Result<PaginatedList<AssignmentListDto>>.Success(
            paginatedList);
    }
}