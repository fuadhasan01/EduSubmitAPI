using EduSubmit.Application.Classes.Commands;
using EduSubmit.Application.Classes.DTOs;
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

    [HttpPost("{subjectId:guid}/teachers")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> AssignTeacher(
    Guid subjectId,
    [FromBody] AssignTeacherToSubjectRequest request,
    CancellationToken cancellationToken)
    {
        var command = new AssignTeacherToSubjectCommand(
            request.TeacherId,
            subjectId);

        var result = await _sender.Send(
            command,
            cancellationToken);

        if (result.IsSuccess)
            return NoContent();

        if (result.Error is "Teacher was not found." or "Subject was not found.")
        {
            return NotFound(new
            {
                message = result.Error
            });
        }

        return BadRequest(new
        {
            message = result.Error
        });
    }

    [HttpPost("{classId:guid}/students")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> EnrollStudent(
    Guid classId,
    [FromBody] EnrollStudentRequest request,
    CancellationToken cancellationToken)
    {
        var command = new EnrollStudentToClassCommand(
            request.StudentId,
            classId);

        var result = await _sender.Send(
            command,
            cancellationToken);

        if (result.IsSuccess)
            return NoContent();

        if (result.Error is "Student was not found." or "Class was not found.")
        {
            return NotFound(new
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