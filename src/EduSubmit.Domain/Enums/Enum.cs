namespace EduSubmit.Domain.Enums;

public enum EnumUserRole
{
    Admin = 1,
    Teacher = 2,
    Student = 3
}

public enum EnumAssignmentStatus
{
    Draft = 1,
    Published = 2
}

public enum EnumSubmissionStatus
{
    Submitted = 1,
    Late = 2,
    Graded = 3,
    ReturnedForRevision = 4
}