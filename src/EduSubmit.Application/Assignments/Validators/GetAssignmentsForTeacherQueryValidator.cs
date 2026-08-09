using EduSubmit.Application.Assignments.Queries;
using FluentValidation;

namespace EduSubmit.Application.Assignments.Validators;

public sealed class GetAssignmentsForTeacherQueryValidator
    : AbstractValidator<GetAssignmentsForTeacherQuery>
{
    public GetAssignmentsForTeacherQueryValidator()
    {
        RuleFor(x => x.PageNumber)
            .GreaterThan(0);

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100);
    }
}