using EduSubmit.Application.Assignments.Queries;
using FluentValidation;

namespace EduSubmit.Application.Assignments.Validators;

public sealed class GetAssignmentByIdQueryValidator : AbstractValidator<GetAssignmentByIdQuery>
{
    public GetAssignmentByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty();
    }
}