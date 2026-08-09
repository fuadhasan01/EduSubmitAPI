using EduSubmit.Domain.Common;
using MediatR;

namespace EduSubmit.Application.Submissions.Commands;

public sealed record GradeSubmissionCommand(
    Guid SubmissionId,
    decimal Marks,
    string? Feedback) : IRequest<Result>;