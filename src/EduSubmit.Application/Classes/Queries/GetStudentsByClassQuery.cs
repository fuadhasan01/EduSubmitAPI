using EduSubmit.Application.Classes.DTOs;
using EduSubmit.Domain.Common;
using MediatR;

namespace EduSubmit.Application.Classes.Queries;

public sealed record GetStudentsByClassQuery(
    Guid ClassId) : IRequest<Result<IReadOnlyList<StudentEnrollmentResponse>>>;
