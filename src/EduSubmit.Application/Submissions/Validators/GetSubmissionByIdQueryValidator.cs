using EduSubmit.Application.Submissions.Queries;
using FluentValidation;

namespace EduSubmit.Application.Submissions.Validators;

public sealed class GetSubmissionByIdQueryValidator
    : AbstractValidator<GetSubmissionByIdQuery>
{
    public GetSubmissionByIdQueryValidator()
    {
        RuleFor(x => x.SubmissionId)
            .NotEmpty();
    }
}