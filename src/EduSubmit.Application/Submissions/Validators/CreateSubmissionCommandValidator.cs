using EduSubmit.Application.Submissions.Commands;
using FluentValidation;

namespace EduSubmit.Application.Submissions.Validators;

public sealed class CreateSubmissionCommandValidator : AbstractValidator<CreateSubmissionCommand>
{
    public CreateSubmissionCommandValidator()
    {
        RuleFor(x => x.AssignmentId)
            .NotEmpty();
    }
}