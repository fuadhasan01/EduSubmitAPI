using EduSubmit.Application.Classes.Commands;
using FluentValidation;

namespace EduSubmit.Application.Classes.Validators;

public sealed class EnrollStudentToClassCommandValidator
    : AbstractValidator<EnrollStudentToClassCommand>
{
    public EnrollStudentToClassCommandValidator()
    {
        RuleFor(x => x.StudentId)
            .NotEmpty()
            .WithMessage("Student is required.");

        RuleFor(x => x.ClassId)
            .NotEmpty()
            .WithMessage("Class is required.");
    }
}