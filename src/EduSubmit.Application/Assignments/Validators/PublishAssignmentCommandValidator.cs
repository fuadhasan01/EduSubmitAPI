using EduSubmit.Application.Assignments.Commands;
using FluentValidation;

namespace EduSubmit.Application.Assignments.Validators;

public sealed class PublishAssignmentCommandValidator : AbstractValidator<PublishAssignmentCommand>
{
    public PublishAssignmentCommandValidator()
    {
        RuleFor(x => x.AssignmentId)
            .NotEmpty();
    }
}