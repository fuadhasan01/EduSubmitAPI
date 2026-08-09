using EduSubmit.Application.Users.Commands;
using EduSubmit.Domain.Enums;
using FluentValidation;

namespace EduSubmit.Application.Users.Validators;

public sealed class CreateUserCommandValidator
    : AbstractValidator<CreateUserCommand>
{
    // Allowed roles for user creation
    private static readonly EnumUserRole[] AllowedRoles =
    [
        EnumUserRole.Teacher,
        EnumUserRole.Student
    ];

    public CreateUserCommandValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(320);

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(6);

        RuleFor(x => x.Role)
            .NotEmpty()
            .Must(role => AllowedRoles.Contains(role))
            .WithMessage(
                "Role must be either Teacher or Student.");
    }
}