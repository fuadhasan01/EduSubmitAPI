using EduSubmit.Application.Assignments.Queries;
using FluentValidation;

namespace EduSubmit.Application.Assignments.Validators;

public sealed class GetAssignmentsForStudentQueryValidator : AbstractValidator<GetAssignmentsForStudentQuery>
{
    public GetAssignmentsForStudentQueryValidator()
    {
        RuleFor(x => x.PageNumber)
            .GreaterThan(0);

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100);
    }
}