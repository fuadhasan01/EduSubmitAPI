using EduSubmit.Application.Submissions.Commands;
using FluentValidation;

namespace EduSubmit.Application.Submissions.Validators;

public sealed class GradeSubmissionCommandValidator : AbstractValidator<GradeSubmissionCommand>
{
    public GradeSubmissionCommandValidator()
    {
        RuleFor(x => x.SubmissionId)
            .NotEmpty();

        RuleFor(x => x.Marks)
            .GreaterThanOrEqualTo(0);
    }
}