using EduSubmit.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduSubmit.Infrastructure.Persistence.Configurations;

public sealed class TeacherSubjectAssignmentConfiguration
    : IEntityTypeConfiguration<TeacherSubjectAssignment>
{
    public void Configure(EntityTypeBuilder<TeacherSubjectAssignment> builder)
    {
        builder.ToTable("TeacherSubjectAssignments");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.TeacherId).IsRequired();
        builder.Property(t => t.SubjectId).IsRequired();

        // Subject N—N Teacher, via this join entity
        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(t => t.TeacherId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Subject>()
            .WithMany()
            .HasForeignKey(t => t.SubjectId)
            .OnDelete(DeleteBehavior.Cascade);

        // Prevent duplicate assignment of the same teacher to the same subject
        builder.HasIndex(t => new { t.TeacherId, t.SubjectId }).IsUnique();
    }
}