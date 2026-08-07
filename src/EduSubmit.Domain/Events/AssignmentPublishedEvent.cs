using EduSubmit.Domain.Common;

namespace EduSubmit.Domain.Events;

public sealed record AssignmentPublishedEvent(
    Guid AssignmentId,
    DateTime OccurredOnUtc) : IDomainEvent;