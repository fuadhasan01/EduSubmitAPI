using EduSubmit.Domain.Common;
using EduSubmit.Domain.Entities;
using EduSubmit.Domain.Enums;
using EduSubmit.Infrastructure.Authentication;
using Microsoft.EntityFrameworkCore;

namespace EduSubmit.Infrastructure.Persistence.Seed;

public static class DbSeeder
{
    public static async Task SeedAsync(
        EduSubmitDbContext context,
        CancellationToken cancellationToken = default)
    {
        await context.Database.MigrateAsync(cancellationToken);

        if (await context.Users.AnyAsync(cancellationToken))
        {
            return;
        }

        var passwordHasher = new BCryptPasswordHasher();

        var adminEmail = Email.Create("admin@edusubmit.com").ValueOrThrow();
        var teacherEmail = Email.Create("teacher@edusubmit.com").ValueOrThrow();
        var studentEmail = Email.Create("student@edusubmit.com").ValueOrThrow();

        var admin = User.Create(
            "System Admin",
            adminEmail,
            passwordHasher.Hash("Admin@123"),
            EnumUserRole.Admin).ValueOrThrow();

        var teacher = User.Create(
            "John Teacher",
            teacherEmail,
            passwordHasher.Hash("Teacher@123"),
            EnumUserRole.Teacher).ValueOrThrow();

        var student = User.Create(
            "Jane Student",
            studentEmail,
            passwordHasher.Hash("Student@123"),
            EnumUserRole.Student).ValueOrThrow();

        context.Users.AddRange(admin, teacher, student);

        await context.SaveChangesAsync(cancellationToken);
    }
}