using EduSubmit.Api.Models.Submissions;
using EduSubmit.Application.Submissions.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduSubmit.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class SubmissionsController : ControllerBase
{
    private readonly ISender _sender;

    public SubmissionsController(ISender sender)
    {
        _sender = sender;
    }

    [Authorize(Roles = "Student")]
    [HttpPost]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create(
        [FromBody] CreateSubmissionCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsSuccess)
            return StatusCode(StatusCodes.Status201Created, result.Value);

        return BadRequest(new
        {
            message = result.Error
        });
    }

    [Authorize(Roles = "Student")]
    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateSubmissionCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.SubmissionId)
        {
            return BadRequest(new
            {
                message = "Submission ID in route and request body must match."
            });
        }

        var result = await _sender.Send(command, cancellationToken);

        if (result.IsSuccess)
            return NoContent();

        return BadRequest(new
        {
            message = result.Error
        });
    }

    [Authorize(Roles = "Teacher")]
    [HttpPut("{id:guid}/grade")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Grade(
    Guid id,
    [FromBody] GradeSubmissionRequest request,
    CancellationToken cancellationToken)
    {
        var command = new GradeSubmissionCommand(
            id,
            request.Marks,
            request.Feedback);

        var result = await _sender.Send(command, cancellationToken);

        if (result.IsSuccess)
            return NoContent();

        return BadRequest(new
        {
            message = result.Error
        });
    }

    [Authorize(Roles = "Teacher")]
    [HttpPut("{id:guid}/return-for-revision")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ReturnForRevision(
    Guid id,
    [FromBody] ReturnSubmissionForRevisionRequest request,
    CancellationToken cancellationToken)
    {
        var command = new ReturnSubmissionForRevisionCommand(
            id,
            request.Feedback);

        var result = await _sender.Send(command, cancellationToken);

        if (result.IsSuccess)
            return NoContent();

        return BadRequest(new
        {
            message = result.Error
        });
    }
}