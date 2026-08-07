using EduSubmit.Domain.Common;

namespace EduSubmit.Domain.Entities;

public sealed class TeacherSubjectAssignment : Entity<Guid>
{
    public Guid TeacherId { get; private set; }

    public Guid SubjectId { get; private set; }

    private TeacherSubjectAssignment(
        Guid id,
        Guid teacherId,
        Guid subjectId)
        : base(id)
    {
        TeacherId = teacherId;
        SubjectId = subjectId;
    }

    public static Result<TeacherSubjectAssignment> Create(
        Guid teacherId,
        Guid subjectId)
    {
        if (teacherId == Guid.Empty)
            return Result<TeacherSubjectAssignment>.Failure(
                "Teacher ID is required.");

        if (subjectId == Guid.Empty)
            return Result<TeacherSubjectAssignment>.Failure(
                "Subject ID is required.");

        return Result<TeacherSubjectAssignment>.Success(
            new TeacherSubjectAssignment(
                Guid.NewGuid(),
                teacherId,
                subjectId));
    }
}