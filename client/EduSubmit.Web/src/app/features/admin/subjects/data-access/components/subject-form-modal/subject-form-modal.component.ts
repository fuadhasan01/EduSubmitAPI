import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../../../../shared/ui/button/button.component';
import { ModalComponent } from '../../../../../../shared/ui/modal/modal.component';

@Component({
  selector: 'app-subject-form-modal',
  standalone: true,
  imports: [ReactiveFormsModule, ModalComponent, ButtonComponent],
  templateUrl: './subject-form-modal.component.html',
  styleUrl: './subject-form-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubjectFormModalComponent {
  private readonly fb = inject(FormBuilder);

  readonly open = input(false);
  readonly className = input<string>('');
  readonly submitting = input(false);
  readonly serverError = input<string | null>(null);

  readonly submitted = output<string>();
  readonly cancelled = output<void>();

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
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

    this.submitted.emit(this.form.getRawValue().name);
  }

  protected close(): void {
    this.cancelled.emit();
  }
}