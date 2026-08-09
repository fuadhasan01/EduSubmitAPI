using EduSubmit.Application.Subjects.DTOs;
using EduSubmit.Domain.Common;
using MediatR;

namespace EduSubmit.Application.Subjects.Commands;

public sealed record CreateSubjectCommand(
    string Name,
    Guid ClassId) : IRequest<Result<SubjectResponse>>;