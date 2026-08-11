import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-teacher-placeholder',
  standalone: true,
  template: `
    <h1>Teacher</h1>
    <p>Teacher features will be implemented later.</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherPlaceholderComponent {}
