using EduSubmit.Application.Classes.DTOs;
using EduSubmit.Domain.Common;
using MediatR;

namespace EduSubmit.Application.Classes.Commands;

public sealed record CreateClassCommand(
    string Name) : IRequest<Result<ClassResponse>>;