using EduSubmit.Domain.Enums;

namespace EduSubmit.Application.Common.Interfaces;

public interface ICurrentUserService
{
    Guid? UserId { get; }
    EnumUserRole Role { get; }
}