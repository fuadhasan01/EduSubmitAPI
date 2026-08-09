using EduSubmit.Application.Submissions.Dtos;
using EduSubmit.Domain.Common;
using MediatR;

namespace EduSubmit.Application.Submissions.Queries;

public sealed record GetSubmissionByIdQuery(
    Guid SubmissionId) : IRequest<Result<SubmissionDetailsDto>>;