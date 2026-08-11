import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (open()) {
      <div class="backdrop" (click)="backdropClick($event)">
        <section
          class="modal"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="title() ? 'modal-title' : null"
        >
          <header class="modal__header">
            <h2 id="modal-title">{{ title() }}</h2>

            <button type="button" class="close" aria-label="Close" (click)="closed.emit()">
              ×
            </button>
          </header>

          <div class="modal__body">
            <ng-content />
          </div>
        </section>
      </div>
    }
  `,
  styleUrl: './modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  readonly open = input(false);
  readonly title = input('');
  readonly closeOnBackdrop = input(true);

  readonly closed = output<void>();

  protected backdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && this.closeOnBackdrop()) {
      this.closed.emit();
    }
  }
}
