using EduSubmit.Application.Subjects.Queries;
using FluentValidation;

namespace EduSubmit.Application.Subjects.Validators;

public sealed class GetSubjectsByClassQueryValidator : AbstractValidator<GetSubjectsByClassQuery>
{
    public GetSubjectsByClassQueryValidator()
    {
        RuleFor(x => x.ClassId)
            .NotEmpty()
            .WithMessage("Class is required.");
    }
}