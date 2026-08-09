using EduSubmit.Application.Users.Commands;
using FluentValidation;

namespace EduSubmit.Application.Users.Validators;

public sealed class DeactivateUserCommandValidator
    : AbstractValidator<DeactivateUserCommand>
{
    public DeactivateUserCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty()
            .WithMessage("User ID is required.");
    }
}