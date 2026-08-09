using EduSubmit.Application.Assignments.Commands;
using EduSubmit.Application.Assignments.Dtos;
using EduSubmit.Application.Assignments.DTOs;
using EduSubmit.Application.Assignments.Queries;
using EduSubmit.Application.Common.Models;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduSubmit.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Teacher")]
public sealed class AssignmentsController : ControllerBase
{
    private readonly ISender _sender;

    public AssignmentsController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Create(
        [FromBody] CreateAssignmentCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
            return MapFailure(result.Error!);

        return CreatedAtAction(
            nameof(Create),
            new { id = result.Value },
            new { id = result.Value });
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateAssignmentRequest request,
        CancellationToken cancellationToken)
    {
        var command = new UpdateAssignmentCommand(
            id,
            request.Title,
            request.Description,
            request.SubjectId,
            request.ClassId,
            request.Deadline,
            request.MaxMarks);

        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
            return MapFailure(result.Error!);

        return NoContent();
    }

    [HttpPost("{id:guid}/publish")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Publish(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(
            new PublishAssignmentCommand(id),
            cancellationToken);

        if (result.IsFailure)
            return MapFailure(result.Error!);

        return NoContent();
    }

    [HttpPost("{id:guid}/unpublish")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Unpublish(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(
            new UnpublishAssignmentCommand(id),
            cancellationToken);

        if (result.IsFailure)
            return MapFailure(result.Error!);

        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(
            new DeleteAssignmentCommand(id),
            cancellationToken);

        if (result.IsFailure)
            return MapFailure(result.Error!);

        return NoContent();
    }

    [Authorize(Roles = "Teacher")]
    [HttpGet("teacher")]
    [ProducesResponseType(typeof(PaginatedList<AssignmentListDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetForTeacher(
    [FromQuery] GetAssignmentsForTeacherQuery query,
    CancellationToken cancellationToken)
    {
        var result = await _sender.Send(query, cancellationToken);

        if (result.IsSuccess)
            return Ok(result.Value);

        return BadRequest(new
        {
            message = result.Error
        });
    }

    private IActionResult MapFailure(string error)
    {
        if (error.EndsWith("was not found.", StringComparison.OrdinalIgnoreCase) ||
            error.Contains("Subject was not found.", StringComparison.OrdinalIgnoreCase) ||
            error.Contains("Class was not found.", StringComparison.OrdinalIgnoreCase))
        {
            return NotFound(new { message = error });
        }

        if (error.Contains("not allowed", StringComparison.OrdinalIgnoreCase))
            return StatusCode(StatusCodes.Status403Forbidden, new { message = error });

        return BadRequest(new { message = error });
    }
}