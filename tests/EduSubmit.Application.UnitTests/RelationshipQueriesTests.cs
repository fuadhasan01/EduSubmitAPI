using EduSubmit.Application.Classes.DTOs;
using EduSubmit.Application.Classes.Queries;
using EduSubmit.Application.Classes.Handlers;

namespace EduSubmit.Application.UnitTests;

public class RelationshipQueriesTests
{
    [Fact]
    public void GetTeachersByClassQueryHandler_type_should_exist()
    {
        Assert.NotNull(typeof(GetTeachersByClassQueryHandler));
        Assert.NotNull(typeof(GetTeachersByClassQuery));
        Assert.NotNull(typeof(TeacherAssignmentResponse));
    }

    [Fact]
    public void GetStudentsByClassQueryHandler_type_should_exist()
    {
        Assert.NotNull(typeof(GetStudentsByClassQueryHandler));
        Assert.NotNull(typeof(GetStudentsByClassQuery));
        Assert.NotNull(typeof(StudentEnrollmentResponse));
    }
}
