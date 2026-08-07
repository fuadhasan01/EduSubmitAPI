using EduSubmit.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduSubmit.Infrastructure.Persistence.Configurations;

public sealed class StudentClassEnrollmentConfiguration
    : IEntityTypeConfiguration<StudentClassEnrollment>
{
    public void Configure(EntityTypeBuilder<StudentClassEnrollment> builder)
    {
        builder.ToTable("StudentClassEnrollments");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.StudentId).IsRequired();
        builder.Property(e => e.ClassId).IsRequired();

        // Class N—N Student, via this join entity
        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(e => e.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Class>()
            .WithMany()
            .HasForeignKey(e => e.ClassId)
            .OnDelete(DeleteBehavior.Cascade);

        // Prevent duplicate enrollment of the same student in the same class
        builder.HasIndex(e => new { e.StudentId, e.ClassId }).IsUnique();
    }
}