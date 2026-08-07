using EduSubmit.Domain.Common;

namespace EduSubmit.Domain.Events;

public sealed record SubmissionCreatedEvent(
    Guid SubmissionId,
    Guid AssignmentId,
    Guid StudentId,
    DateTime OccurredOnUtc) : IDomainEvent;