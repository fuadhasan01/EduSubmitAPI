import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="buttonClasses()"
      (click)="clicked.emit()"
    >
      @if (loading()) {
        <span class="spinner" aria-hidden="true"></span>
      }

      @if (!loading()) {
        <span>{{ label() }}</span>
      }

      @if (loading()) {
        <span>{{ loadingLabel() }}</span>
      }
    </button>
  `,
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  readonly label = input('Button');
  readonly loadingLabel = input('Loading...');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly variant = input<'primary' | 'secondary' | 'danger' | 'ghost'>('primary');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly fullWidth = input(false);

  readonly clicked = output<void>();

  protected buttonClasses(): string {
    return ['button', `button--${this.variant()}`, this.fullWidth() ? 'button--full-width' : '']
      .filter(Boolean)
      .join(' ');
  }
}
