using EduSubmit.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduSubmit.Infrastructure.Persistence.Configurations;

public sealed class AssignmentConfiguration : IEntityTypeConfiguration<Assignment>
{
    public void Configure(EntityTypeBuilder<Assignment> builder)
    {
        builder.ToTable("Assignments");

        builder.HasKey(a => a.Id);
        builder.Ignore(a => a.DomainEvents);

        builder.Property(a => a.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(a => a.Description)
            .IsRequired()
            .HasColumnType("text");

        builder.Property(a => a.SubjectId).IsRequired();
        builder.Property(a => a.ClassId).IsRequired();
        builder.Property(a => a.TeacherId).IsRequired();

        builder.Property(a => a.Deadline)
            .HasColumnType("timestamptz")
            .IsRequired();

        builder.Property(a => a.CreatedAt)
            .HasColumnType("timestamptz")
            .IsRequired();

        builder.Property(a => a.MaxMarks)
            .HasPrecision(6, 2)
            .IsRequired();

        builder.Property(a => a.Status)
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        // Assignment N—1 Subject / Class / Teacher
        builder.HasOne<Subject>()
            .WithMany()
            .HasForeignKey(a => a.SubjectId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Class>()
            .WithMany()
            .HasForeignKey(a => a.ClassId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(a => a.TeacherId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(a => new { a.ClassId, a.SubjectId, a.Deadline });
    }
}