using EduSubmit.Application.Subjects.DTOs;
using EduSubmit.Domain.Common;
using MediatR;

namespace EduSubmit.Application.Subjects.Queries;

public sealed record GetSubjectsByClassQuery(
    Guid ClassId) : IRequest<Result<IReadOnlyList<SubjectResponse>>>;