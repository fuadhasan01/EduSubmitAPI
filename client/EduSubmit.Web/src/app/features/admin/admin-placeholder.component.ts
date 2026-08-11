import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-admin-placeholder',
  standalone: true,
  template: `
    <h1>Admin</h1>
    <p>Admin features will be implemented later.</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPlaceholderComponent {}
