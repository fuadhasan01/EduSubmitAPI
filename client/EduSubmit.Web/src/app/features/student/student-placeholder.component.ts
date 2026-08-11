import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-student-placeholder',
  standalone: true,
  template: `
    <h1>Student</h1>
    <p>Student features will be implemented later.</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentPlaceholderComponent {}
