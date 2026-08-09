using EduSubmit.Application.Submissions.Commands;
using FluentValidation;

namespace EduSubmit.Application.Submissions.Validators;

public sealed class UpdateSubmissionCommandValidator : AbstractValidator<UpdateSubmissionCommand>
{
    public UpdateSubmissionCommandValidator()
    {
        RuleFor(x => x.SubmissionId)
            .NotEmpty();
    }
}