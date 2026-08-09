using EduSubmit.Application.Classes.Commands;
using FluentValidation;

namespace EduSubmit.Application.Classes.Validators;

public sealed class CreateClassCommandValidator : AbstractValidator<CreateClassCommand>
{
    public CreateClassCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(100)
            .WithMessage("Class name is required and must not exceed 100 characters.");
    }
}