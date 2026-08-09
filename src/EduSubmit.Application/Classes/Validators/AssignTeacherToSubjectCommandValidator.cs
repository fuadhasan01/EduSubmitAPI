using EduSubmit.Application.Classes.Commands;
using FluentValidation;

namespace EduSubmit.Application.Classes.Validators;

public sealed class AssignTeacherToSubjectCommandValidator
    : AbstractValidator<AssignTeacherToSubjectCommand>
{
    public AssignTeacherToSubjectCommandValidator()
    {
        RuleFor(x => x.TeacherId)
            .NotEmpty()
            .WithMessage("Teacher is required.");

        RuleFor(x => x.SubjectId)
            .NotEmpty()
            .WithMessage("Subject is required.");
    }
}