import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-login-placeholder',
  standalone: true,
  template: `
    <h1>Login</h1>
    <p>Login page will be implemented in the authentication UI phase.</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPlaceholderComponent {}
