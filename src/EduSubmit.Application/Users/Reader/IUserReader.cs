using EduSubmit.Domain.Entities;

namespace EduSubmit.Application.Users.Reader;

public interface IUserReader
{
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);

    Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default);
}