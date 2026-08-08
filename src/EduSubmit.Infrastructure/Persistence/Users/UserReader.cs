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

    public async Task<User?> GetByEmailAsync(
        string email,
        CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .FirstOrDefaultAsync(
                user => user.Email.Value == email,
                cancellationToken);
    }
}