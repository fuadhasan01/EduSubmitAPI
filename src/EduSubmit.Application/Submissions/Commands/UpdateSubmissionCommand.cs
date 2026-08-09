using EduSubmit.Domain.Common;
using MediatR;

namespace EduSubmit.Application.Submissions.Commands;

public sealed record UpdateSubmissionCommand(
    Guid SubmissionId,
    string? Content,
    string? FileUrl) : IRequest<Result>;