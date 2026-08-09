using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EduSubmit.Api.Controllers;

[ApiController]
[Route("api/auth-test")]
[Authorize]
public sealed class AuthTestController : ControllerBase
{
    [HttpGet]
    public IActionResult GetAuthenticatedUser()
    {
        return Ok(new
        {
            message = "Authentication successful.",
            userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? User.FindFirstValue(ClaimTypes.Name),
            email = User.FindFirstValue(ClaimTypes.Email),
            role = User.FindFirstValue(ClaimTypes.Role),
            claims = User.Claims.Select(c => new
            {
                c.Type,
                c.Value
            })
        });
    }

    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    public IActionResult AdminOnly()
    {
        return Ok(new
        {
            message = "Admin authorization successful.",
            role = User.FindFirstValue(ClaimTypes.Role)
        });
    }

    [HttpGet("teacher")]
    [Authorize(Roles = "Teacher")]
    public IActionResult TeacherOnly()
    {
        return Ok(new
        {
            message = "Teacher authorization successful.",
            role = User.FindFirstValue(ClaimTypes.Role)
        });
    }

    [HttpGet("student")]
    [Authorize(Roles = "Student")]
    public IActionResult StudentOnly()
    {
        return Ok(new
        {
            message = "Student authorization successful.",
            role = User.FindFirstValue(ClaimTypes.Role)
        });
    }
}