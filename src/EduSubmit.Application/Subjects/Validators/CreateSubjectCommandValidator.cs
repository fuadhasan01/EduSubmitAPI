using EduSubmit.Application.Subjects.Commands;
using FluentValidation;

namespace EduSubmit.Application.Subjects.Validators;

public sealed class CreateSubjectCommandValidator : AbstractValidator<CreateSubjectCommand>
{
    public CreateSubjectCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(150)
            .WithMessage("Subject name is required and must not exceed 150 characters.");

        RuleFor(x => x.ClassId)
            .NotEmpty()
            .WithMessage("Class is required.");
    }
}