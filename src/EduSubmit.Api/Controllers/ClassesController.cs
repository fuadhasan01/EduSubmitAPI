using EduSubmit.Application.Classes.Commands;
using EduSubmit.Application.Classes.DTOs;
using EduSubmit.Application.Classes.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduSubmit.Api.Controllers;

[ApiController]
[Route("api/classes")]
[Authorize]
public sealed class ClassesController : ControllerBase
{
    private readonly ISender _sender;

    public ClassesController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(
        typeof(ClassResponse),
        StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create(
        [FromBody] CreateClassCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(
            command,
            cancellationToken);

        if (result.IsSuccess)
        {
            return StatusCode(
                StatusCodes.Status201Created,
                result.Value);
        }

        return BadRequest(new
        {
            message = result.Error
        });
    }

    [HttpGet]
    [ProducesResponseType(
        typeof(IReadOnlyList<ClassResponse>),
        StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAll(
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(
            new GetClassesQuery(),
            cancellationToken);

        if (result.IsSuccess)
            return Ok(result.Value);

        return BadRequest(new
        {
            message = result.Error
        });
    }
}