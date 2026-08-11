import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-error-message',
  standalone: true,
  template: `
    @if (message()) {
      <div class="error-message" role="alert">
        <strong>{{ title() }}</strong>
        <span>{{ message() }}</span>
      </div>
    }
  `,
  styleUrl: './error-message.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorMessageComponent {
  readonly title = input('Something went wrong');
  readonly message = input('');
}
