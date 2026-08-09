using EduSubmit.Domain.Common;
using MediatR;

namespace EduSubmit.Application.Submissions.Commands;

public sealed record ReturnSubmissionForRevisionCommand(
    Guid SubmissionId,
    string Feedback) : IRequest<Result>;