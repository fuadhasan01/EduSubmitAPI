using EduSubmit.Application.Users.Writer;
using EduSubmit.Domain.Entities;

namespace EduSubmit.Infrastructure.Persistence.Users;

public sealed class UserWriter : IUserWriter
{
    private readonly EduSubmitDbContext _context;

    public UserWriter(EduSubmitDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(User user, CancellationToken cancellationToken = default)
    {
        await _context.Users.AddAsync(user, cancellationToken);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}