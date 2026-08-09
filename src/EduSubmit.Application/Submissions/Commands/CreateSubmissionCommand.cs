using EduSubmit.Domain.Common;
using MediatR;

namespace EduSubmit.Application.Submissions.Commands;

public sealed record CreateSubmissionCommand(
    Guid AssignmentId,
    string? Content,
    string? FileUrl) : IRequest<Result<Guid>>;