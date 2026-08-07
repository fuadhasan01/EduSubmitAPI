using EduSubmit.Application.Common.Interfaces;
using EduSubmit.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduSubmit.Infrastructure.Persistence;

public sealed class EduSubmitDbContext : DbContext, IApplicationDbContext
{
    public EduSubmitDbContext(
        DbContextOptions<EduSubmitDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<Class> Classes => Set<Class>();

    public DbSet<Subject> Subjects => Set<Subject>();

    public DbSet<TeacherSubjectAssignment> TeacherSubjectAssignments => Set<TeacherSubjectAssignment>();

    public DbSet<StudentClassEnrollment> StudentClassEnrollments => Set<StudentClassEnrollment>();

    public DbSet<Assignment> Assignments => Set<Assignment>();

    public DbSet<Submission> Submissions => Set<Submission>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(EduSubmitDbContext).Assembly);
    }
}