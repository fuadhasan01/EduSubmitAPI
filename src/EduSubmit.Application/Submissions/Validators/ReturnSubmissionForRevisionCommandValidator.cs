using EduSubmit.Application.Submissions.Commands;
using FluentValidation;

namespace EduSubmit.Application.Submissions.Validators;

public sealed class ReturnSubmissionForRevisionCommandValidator
    : AbstractValidator<ReturnSubmissionForRevisionCommand>
{
    public ReturnSubmissionForRevisionCommandValidator()
    {
        RuleFor(x => x.SubmissionId)
            .NotEmpty();

        RuleFor(x => x.Feedback)
            .NotEmpty()
            .MaximumLength(2000);
    }
}