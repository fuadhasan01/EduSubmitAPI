using EduSubmit.Application.Submissions.Queries;
using FluentValidation;

namespace EduSubmit.Application.Submissions.Validators;

public sealed class GetAllSubmissionsQueryValidator
    : AbstractValidator<GetAllSubmissionsQuery>
{
    public GetAllSubmissionsQueryValidator()
    {
        RuleFor(x => x.PageNumber)
            .GreaterThan(0);

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100);
    }
}