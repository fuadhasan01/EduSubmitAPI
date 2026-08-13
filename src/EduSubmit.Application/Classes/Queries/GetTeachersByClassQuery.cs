using EduSubmit.Application.Classes.DTOs;
using EduSubmit.Domain.Common;
using MediatR;

namespace EduSubmit.Application.Classes.Queries;

public sealed record GetTeachersByClassQuery(
    Guid ClassId) : IRequest<Result<IReadOnlyList<TeacherAssignmentResponse>>>;
