import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ModalComponent } from '../../../../../shared/ui/modal/modal.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { CreateClassRequest } from '../../../../../core/models/class.model';

@Component({
  selector: 'app-class-form-modal',
  standalone: true,
  imports: [ReactiveFormsModule, ModalComponent, ButtonComponent],
  templateUrl: './class-form-modal.component.html',
  styleUrl: './class-form-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassFormModalComponent {
  private readonly fb = inject(FormBuilder);

  readonly open = input(false);
  readonly submitting = input(false);
  readonly serverError = input<string | null>(null);

  readonly submitted = output<CreateClassRequest>();
  readonly cancelled = output<void>();

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
  });

  constructor() {
    effect(() => {
      if (!this.open()) {
        this.form.reset({ name: '' });
      }
    });
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit(this.form.getRawValue());
  }

  protected close(): void {
    this.cancelled.emit();
  }
}
