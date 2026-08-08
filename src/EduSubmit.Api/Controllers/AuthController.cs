using EduSubmit.Application.Users.Commands;
using EduSubmit.Application.Users.DTOs;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EduSubmit.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AuthController : ControllerBase
{
    private readonly ISender _sender;

    public AuthController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost("login")]
    [ProducesResponseType(
        typeof(LoginResponse),
        StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login(
        [FromBody] LoginCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(
            command,
            cancellationToken);

        if (result.IsSuccess)
        {
            return Ok(result.Value);
        }

        if (result.Error == "Invalid email or password.")
        {
            return Unauthorized(new
            {
                message = result.Error
            });
        }

        return BadRequest(new
        {
            message = result.Error
        });
    }
}