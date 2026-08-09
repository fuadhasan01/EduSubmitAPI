using EduSubmit.Application.Assignments.Commands;
using FluentValidation;

namespace EduSubmit.Application.Assignments.Validators;

public sealed class UnpublishAssignmentCommandValidator : AbstractValidator<UnpublishAssignmentCommand>
{
    public UnpublishAssignmentCommandValidator()
    {
        RuleFor(x => x.AssignmentId)
            .NotEmpty();
    }
}