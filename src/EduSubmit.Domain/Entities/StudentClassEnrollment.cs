using EduSubmit.Domain.Common;

namespace EduSubmit.Domain.Entities;

public sealed class StudentClassEnrollment : Entity<Guid>
{
    public Guid StudentId { get; private set; }

    public Guid ClassId { get; private set; }

    private StudentClassEnrollment(
        Guid id,
        Guid studentId,
        Guid classId)
        : base(id)
    {
        StudentId = studentId;
        ClassId = classId;
    }

    public static Result<StudentClassEnrollment> Create(
        Guid studentId,
        Guid classId)
    {
        if (studentId == Guid.Empty)
            return Result<StudentClassEnrollment>.Failure(
                "Student ID is required.");

        if (classId == Guid.Empty)
            return Result<StudentClassEnrollment>.Failure(
                "Class ID is required.");

        return Result<StudentClassEnrollment>.Success(
            new StudentClassEnrollment(
                Guid.NewGuid(),
                studentId,
                classId));
    }
}