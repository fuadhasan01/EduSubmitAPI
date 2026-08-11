import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { ButtonComponent } from '../button/button.component';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [ButtonComponent, ModalComponent],
  template: `
    <app-modal [open]="open()" [title]="title()" (closed)="cancelled.emit()">
      <p>{{ message() }}</p>

      <div class="actions">
        <app-button label="Cancel" variant="secondary" (clicked)="cancelled.emit()" />

        <app-button
          [label]="confirmLabel()"
          [variant]="danger() ? 'danger' : 'primary'"
          [loading]="loading()"
          (clicked)="confirmed.emit()"
        />
      </div>
    </app-modal>
  `,
  styleUrl: './confirmation-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationDialogComponent {
  readonly open = input(false);
  readonly title = input('Confirm action');
  readonly message = input('Are you sure you want to continue?');
  readonly confirmLabel = input('Confirm');
  readonly danger = input(false);
  readonly loading = input(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
