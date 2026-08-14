using EduSubmit.Domain.Common;
using EduSubmit.Domain.Entities;
using EduSubmit.Domain.Enums;
using EduSubmit.Infrastructure.Authentication;
using Microsoft.EntityFrameworkCore;

namespace EduSubmit.Infrastructure.Persistence.Seed;

public static class DbSeeder
{
    public static async Task SeedAsync(
        EduSubmitDbContext context,
        CancellationToken cancellationToken = default)
    {
        await context.Database.MigrateAsync(cancellationToken);

        if (await context.Users.AnyAsync(cancellationToken))
        {
            return;
        }

        var passwordHasher = new BCryptPasswordHasher();

        var admin = CreateUser(
            "System Admin",
            "admin@edusubmit.com",
            "Admin@123",
            EnumUserRole.Admin,
            passwordHasher);

        var teachers = new[]
        {
            CreateUser("Md. Rakib Hasan", "rakib.hasan@edusubmit.com", "Teacher@123", EnumUserRole.Teacher, passwordHasher),
            CreateUser("Nusrat Jahan", "nusrat.jahan@edusubmit.com", "Teacher@123", EnumUserRole.Teacher, passwordHasher),
            CreateUser("Mohammad Saiful Islam", "saiful.islam@edusubmit.com", "Teacher@123", EnumUserRole.Teacher, passwordHasher),
            CreateUser("Farzana Akter", "farzana.akter@edusubmit.com", "Teacher@123", EnumUserRole.Teacher, passwordHasher)
        };

        var students = new[]
        {
            CreateUser("Arafat Hossain", "arafat.hossain@edusubmit.com", "Student@123", EnumUserRole.Student, passwordHasher),
            CreateUser("Sumaiya Rahman", "sumaiya.rahman@edusubmit.com", "Student@123", EnumUserRole.Student, passwordHasher),
            CreateUser("Tanvir Ahmed", "tanvir.ahmed@edusubmit.com", "Student@123", EnumUserRole.Student, passwordHasher),
            CreateUser("Nusrat Tasnim", "nusrat.tasnim@edusubmit.com", "Student@123", EnumUserRole.Student, passwordHasher),
            CreateUser("Sakib Hasan", "sakib.hasan@edusubmit.com", "Student@123", EnumUserRole.Student, passwordHasher),
            CreateUser("Mim Akter", "mim.akter@edusubmit.com", "Student@123", EnumUserRole.Student, passwordHasher),
            CreateUser("Fahim Rahman", "fahim.rahman@edusubmit.com", "Student@123", EnumUserRole.Student, passwordHasher),
            CreateUser("Jannatul Ferdous", "jannatul.ferdous@edusubmit.com", "Student@123", EnumUserRole.Student, passwordHasher),
            CreateUser("Mehedi Hasan", "mehedi.hasan@edusubmit.com", "Student@123", EnumUserRole.Student, passwordHasher),
            CreateUser("Tanjim Ahmed", "tanjim.ahmed@edusubmit.com", "Student@123", EnumUserRole.Student, passwordHasher),
            CreateUser("Sadman Islam", "sadman.islam@edusubmit.com", "Student@123", EnumUserRole.Student, passwordHasher),
            CreateUser("Raisa Karim", "raisa.karim@edusubmit.com", "Student@123", EnumUserRole.Student, passwordHasher)
        };

        context.Users.AddRange(admin);
        context.Users.AddRange(teachers);
        context.Users.AddRange(students);
        await context.SaveChangesAsync(cancellationToken);

        var classes = new[]
        {
            Class.Create("Grade 7A").ValueOrThrow(),
            Class.Create("Grade 8B").ValueOrThrow(),
            Class.Create("Grade 9C").ValueOrThrow(),
            Class.Create("Grade 10A").ValueOrThrow()
        };

        context.Classes.AddRange(classes);
        await context.SaveChangesAsync(cancellationToken);

        var classSubjects = new Dictionary<Guid, List<Subject>>();
        var subjectCatalog = new[]
        {
            "Mathematics",
            "Science",
            "English",
            "History",
            "Computer Science",
            "Art"
        };

        foreach (var schoolClass in classes)
        {
            var subjectList = new List<Subject>();

            foreach (var subjectName in subjectCatalog.Take(4))
            {
                subjectList.Add(
                    Subject.Create(subjectName, schoolClass.Id).ValueOrThrow());
            }

            context.Subjects.AddRange(subjectList);
            classSubjects[schoolClass.Id] = subjectList;
        }

        await context.SaveChangesAsync(cancellationToken);

        var teacherSubjectAssignments = new List<TeacherSubjectAssignment>();
        var teacherForSubject = new Dictionary<Guid, Guid>();
        var teacherIndex = 0;

        foreach (var schoolClass in classes)
        {
            foreach (var subject in classSubjects[schoolClass.Id])
            {
                var assignedTeacher = teachers[teacherIndex % teachers.Length];
                teacherIndex++;

                var assignment = TeacherSubjectAssignment.Create(
                    assignedTeacher.Id,
                    subject.Id).ValueOrThrow();

                teacherSubjectAssignments.Add(assignment);
                teacherForSubject[subject.Id] = assignedTeacher.Id;
            }
        }

        context.TeacherSubjectAssignments.AddRange(teacherSubjectAssignments);
        await context.SaveChangesAsync(cancellationToken);

        var studentClassEnrollments = new List<StudentClassEnrollment>();

        for (var classIndex = 0; classIndex < classes.Length; classIndex++)
        {
            var schoolClass = classes[classIndex];
            var classStudents = students
                .Skip(classIndex * 3)
                .Take(6)
                .ToList();

            foreach (var student in classStudents)
            {
                studentClassEnrollments.Add(
                    StudentClassEnrollment.Create(student.Id, schoolClass.Id).ValueOrThrow());
            }
        }

        context.StudentClassEnrollments.AddRange(studentClassEnrollments);
        await context.SaveChangesAsync(cancellationToken);

        var assignments = new List<Assignment>();
        var assignmentCounter = 0;

        foreach (var schoolClass in classes)
        {
            foreach (var subject in classSubjects[schoolClass.Id])
            {
                var teacherId = teacherForSubject[subject.Id];
                var assignmentDateOffset = assignmentCounter % 4;
                var deadline = DateTime.UtcNow.AddDays(3 + assignmentDateOffset).AddHours(5);

                var assignment = Assignment.Create(
                    $"{subject.Name} Unit {assignmentCounter + 1}",
                    $"Complete the tasks for the {subject.Name} unit and submit your work before the deadline. Include examples, reasoning, and final answers.",
                    subject.Id,
                    schoolClass.Id,
                    teacherId,
                    deadline,
                    100m + (assignmentCounter * 5m)).ValueOrThrow();

                if (assignmentCounter % 3 == 0)
                {
                    assignment.Publish();
                }

                assignments.Add(assignment);
                assignmentCounter++;
            }
        }

        context.Assignments.AddRange(assignments);
        await context.SaveChangesAsync(cancellationToken);

        var submissions = new List<Submission>();

        foreach (var assignment in assignments)
        {
            var enrolledStudents = studentClassEnrollments
                .Where(e => e.ClassId == assignment.ClassId)
                .Select(e => e.StudentId)
                .ToList();

            if (enrolledStudents.Count == 0)
            {
                continue;
            }

            var submissionTargets = enrolledStudents
                .OrderBy(studentId => studentId)
                .Take(Math.Min(3, enrolledStudents.Count))
                .ToList();

            foreach (var studentId in submissionTargets)
            {
                var studentSubmission = Submission.Create(
                    assignment.Id,
                    studentId,
                    $"I completed the {assignment.Title} activity and included my reasoning and final answer summary.",
                    null,
                    assignment.Deadline.AddDays(-1)).ValueOrThrow();

                if (assignment.Status == EnumAssignmentStatus.Published && studentId != submissionTargets.First())
                {
                    var gradeMark = (assignment.MaxMarks * 0.85m) + (studentId.GetHashCode() % 10);
                    studentSubmission.Grade(gradeMark, "Good work. Please improve the explanation for one section.", assignment.MaxMarks);
                }
                else if (assignment.Status == EnumAssignmentStatus.Draft)
                {
                    studentSubmission.ReturnForRevision("Please add more evidence and clarify your final conclusion.");
                }
                else
                {
                    studentSubmission.ReturnForRevision("Your answer is close, but needs clearer steps and stronger evidence.");
                }

                submissions.Add(studentSubmission);
            }

            var nonSubmittedStudent = enrolledStudents
                .Except(submissionTargets)
                .FirstOrDefault();

            if (nonSubmittedStudent != Guid.Empty)
            {
                var draftSubmission = Submission.Create(
                    assignment.Id,
                    nonSubmittedStudent,
                    "I am still working on this assignment and plan to submit it soon.",
                    null,
                    assignment.Deadline.AddDays(2)).ValueOrThrow();

                submissions.Add(draftSubmission);
            }
        }

        context.Submissions.AddRange(submissions);
        await context.SaveChangesAsync(cancellationToken);
    }

    private static User CreateUser(
        string fullName,
        string email,
        string password,
        EnumUserRole role,
        BCryptPasswordHasher passwordHasher)
    {
        var emailValue = Email.Create(email).ValueOrThrow();

        return User.Create(
            fullName,
            emailValue,
            passwordHasher.Hash(password),
            role).ValueOrThrow();
    }
}