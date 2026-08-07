using System.Net.Mail;

namespace EduSubmit.Domain.Common;

public sealed class Email : ValueObject
{
    public string Value { get; }
    private Email(string value)
    {
        Value = value;
    }
    public static Result<Email> Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return Result<Email>.Failure("Email is required.");

        var normalizedValue = value.Trim().ToLowerInvariant();

        try
        {
            var mailAddress = new MailAddress(normalizedValue);

            if (mailAddress.Address != normalizedValue)
                return Result<Email>.Failure("Email format is invalid.");
        }
        catch (FormatException)
        {
            return Result<Email>.Failure("Email format is invalid.");
        }

        return Result<Email>.Success(new Email(normalizedValue));
    }
    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }
    public override string ToString()
    {
        return Value;
    }
}