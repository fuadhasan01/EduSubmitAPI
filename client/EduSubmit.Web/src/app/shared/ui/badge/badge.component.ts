import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `
    <span class="badge" [class]="'badge badge--' + variant()">
      {{ text() }}
    </span>
  `,
  styleUrl: './badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  readonly text = input('');
  readonly variant = input<'default' | 'success' | 'warning' | 'danger' | 'info'>('default');
}
