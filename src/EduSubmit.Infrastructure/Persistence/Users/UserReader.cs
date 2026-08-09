using EduSubmit.Application.Common.Models;
using EduSubmit.Application.Users.Reader;
using EduSubmit.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduSubmit.Infrastructure.Persistence.Users;

public sealed class UserReader : IUserReader
{
    private readonly EduSubmitDbContext _context;

    public UserReader(EduSubmitDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .FirstOrDefaultAsync(
                user => user.Email.Value == email,
                cancellationToken);
    }

    public async Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .AnyAsync(
                user => user.Email.Value == email,
                cancellationToken);
    }

    public async Task<PaginatedList<User>> GetUsersAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = _context.Users.AsNoTracking().OrderBy(user => user.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);

        var users = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PaginatedList<User>(users, totalCount, pageNumber, pageSize);
    }
}