using EduSubmit.Domain.Entities;

namespace EduSubmit.Application.Users.Writer;

public interface IUserWriter
{
    Task AddAsync(User user, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}