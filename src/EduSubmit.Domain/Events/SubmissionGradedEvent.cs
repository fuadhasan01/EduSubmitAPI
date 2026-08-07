using EduSubmit.Domain.Common;

namespace EduSubmit.Domain.Events;

public sealed record SubmissionGradedEvent(
    Guid SubmissionId,
    Guid AssignmentId,
    Guid StudentId,
    decimal Marks,
    DateTime OccurredOnUtc) : IDomainEvent;