namespace EduSubmit.Domain.Common;

public interface IDomainEvent
{
    DateTime OccurredOnUtc { get; }
}