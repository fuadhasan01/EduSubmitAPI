using EduSubmit.Application.Common.Interfaces;
using EduSubmit.Application.Users.Reader;
using EduSubmit.Application.Users.Writer;
using EduSubmit.Infrastructure.Authentication;
using EduSubmit.Infrastructure.Persistence;
using EduSubmit.Infrastructure.Persistence.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace EduSubmit.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString =
            configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "Connection string 'DefaultConnection' was not found.");

        services.AddDbContext<EduSubmitDbContext>(options =>
        {
            options.UseNpgsql(connectionString);
        });

        services.AddScoped<IApplicationDbContext>(
            provider =>
                provider.GetRequiredService<EduSubmitDbContext>());

        services.Configure<JwtSettings>(
            configuration.GetSection(JwtSettings.SectionName));

        services.AddScoped<IJwtService, JwtService>();

        services.AddScoped<IPasswordHasher, BCryptPasswordHasher>();
        services.AddScoped<IUserReader, UserReader>();
        services.AddScoped<IUserWriter, UserWriter>();
        return services;
    }
}