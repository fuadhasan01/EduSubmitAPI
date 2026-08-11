import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  template: `
    @if (visible()) {
      <div class="loading" role="status" aria-live="polite">
        <span class="spinner"></span>
        <span>{{ message() }}</span>
      </div>
    }
  `,
  styleUrl: './loading.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingComponent {
  readonly visible = input(true);
  readonly message = input('Loading...');
}
