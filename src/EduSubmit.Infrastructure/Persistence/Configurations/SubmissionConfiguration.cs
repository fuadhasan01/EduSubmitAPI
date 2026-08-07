using EduSubmit.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduSubmit.Infrastructure.Persistence.Configurations;

public sealed class SubmissionConfiguration : IEntityTypeConfiguration<Submission>
{
    public void Configure(EntityTypeBuilder<Submission> builder)
    {
        builder.ToTable("Submissions");

        builder.HasKey(s => s.Id);
        builder.Ignore(s => s.DomainEvents);

        builder.Property(s => s.AssignmentId).IsRequired();
        builder.Property(s => s.StudentId).IsRequired();

        builder.Property(s => s.Content).HasColumnType("text");
        builder.Property(s => s.FileUrl).HasMaxLength(2048);

        builder.Property(s => s.SubmittedAt)
            .HasColumnType("timestamptz")
            .IsRequired();

        builder.Property(s => s.GradedAt)
            .HasColumnType("timestamptz");

        builder.Property(s => s.Status)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(s => s.Marks)
            .HasPrecision(6, 2);

        builder.Property(s => s.Feedback)
            .HasColumnType("text");

        // Submission N—1 Assignment / Student
        builder.HasOne<Assignment>()
            .WithMany()
            .HasForeignKey(s => s.AssignmentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(s => s.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        // One submission per student per assignment (Update() handles resubmission)
        builder.HasIndex(s => new { s.AssignmentId, s.StudentId }).IsUnique();
    }
}