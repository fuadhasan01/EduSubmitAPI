import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <section class="empty-state">
      <div class="icon">{{ icon() }}</div>
      <h2>{{ title() }}</h2>
      <p>{{ message() }}</p>

      @if (actionLabel()) {
        <button type="button" (click)="action.emit()">
          {{ actionLabel() }}
        </button>
      }
    </section>
  `,
  styleUrl: './empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly icon = input('∅');
  readonly title = input('No data');
  readonly message = input('There is nothing to display.');
  readonly actionLabel = input('');

  readonly action = output<void>();
}
