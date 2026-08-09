using EduSubmit.Application.Subjects.Commands;
using EduSubmit.Application.Subjects.DTOs;
using EduSubmit.Application.Subjects.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduSubmit.Api.Controllers;

[ApiController]
[Route("api/subjects")]
[Authorize]
public sealed class SubjectsController : ControllerBase
{
    private readonly ISender _sender;

    public SubjectsController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(
        typeof(SubjectResponse),
        StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create(
        [FromBody] CreateSubjectCommand command,
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

    [HttpGet("class/{classId:guid}")]
    [ProducesResponseType(
        typeof(IReadOnlyList<SubjectResponse>),
        StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByClass(
        Guid classId,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(
            new GetSubjectsByClassQuery(classId),
            cancellationToken);

        if (result.IsSuccess)
            return Ok(result.Value);

        if (result.Error == "Class was not found.")
            return NotFound(new
            {
                message = result.Error
            });

        return BadRequest(new
        {
            message = result.Error
        });
    }
}