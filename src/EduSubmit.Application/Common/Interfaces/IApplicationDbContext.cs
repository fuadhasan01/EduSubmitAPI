using EduSubmit.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduSubmit.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }

    DbSet<Class> Classes { get; }

    DbSet<Subject> Subjects { get; }

    DbSet<TeacherSubjectAssignment> TeacherSubjectAssignments { get; }

    DbSet<StudentClassEnrollment> StudentClassEnrollments { get; }

    DbSet<Assignment> Assignments { get; }

    DbSet<Submission> Submissions { get; }

    Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default);
}