using EduSubmit.Application.Assignments.Commands;
using FluentValidation;

namespace EduSubmit.Application.Assignments.Validators;

public sealed class DeleteAssignmentCommandValidator : AbstractValidator<DeleteAssignmentCommand>
{
    public DeleteAssignmentCommandValidator()
    {
        RuleFor(x => x.AssignmentId)
            .NotEmpty();
    }
}