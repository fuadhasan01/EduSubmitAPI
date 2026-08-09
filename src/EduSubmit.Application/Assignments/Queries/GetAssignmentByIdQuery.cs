using EduSubmit.Application.Assignments.Dtos;
using EduSubmit.Domain.Common;
using MediatR;

namespace EduSubmit.Application.Assignments.Queries;

public sealed record GetAssignmentByIdQuery(Guid Id)
    : IRequest<Result<AssignmentListDto>>;