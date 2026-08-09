using EduSubmit.Application.Assignments.Commands;
using FluentValidation;

namespace EduSubmit.Application.Assignments.Validators;

public sealed class CreateAssignmentCommandValidator : AbstractValidator<CreateAssignmentCommand>
{
    public CreateAssignmentCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.SubjectId)
            .NotEmpty();

        RuleFor(x => x.ClassId)
            .NotEmpty();

        RuleFor(x => x.Deadline)
            .GreaterThan(DateTime.UtcNow)
            .WithMessage("Deadline must be in the future.");

        RuleFor(x => x.MaxMarks)
            .GreaterThan(0)
            .WithMessage("Maximum marks must be greater than zero.");
    }
}