using EduSubmit.Application.Classes.DTOs;
using EduSubmit.Domain.Common;
using MediatR;

namespace EduSubmit.Application.Classes.Queries;

public sealed record GetClassesQuery
    : IRequest<Result<IReadOnlyList<ClassResponse>>>;