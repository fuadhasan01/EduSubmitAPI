import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { ModalComponent } from '../../../../../shared/ui/modal/modal.component';
import { GradeSubmissionRequest } from '../../../../../core/models/submission.model';

@Component({
  selector: 'app-grade-submission-modal',
  standalone: true,
  imports: [ReactiveFormsModule, ModalComponent, ButtonComponent],
  templateUrl: './grade-submission-modal.component.html',
  styleUrl: './grade-submission-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GradeSubmissionModalComponent {
  private readonly fb = inject(FormBuilder);

  readonly open = input(false);
  readonly submitting = input(false);
  readonly maxMarks = input<number | null>(null);
  readonly serverError = input<string | null>(null);

  readonly submitted = output<GradeSubmissionRequest>();
  readonly cancelled = output<void>();

  protected readonly form = this.fb.nonNullable.group({
    marks: [0, [Validators.required, Validators.min(0)]],
    feedback: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  constructor() {
    effect(() => {
      if (!this.open()) {
        this.form.reset({
          marks: 0,
          feedback: '',
        });
      }

      const maxMarks = this.maxMarks();

      if (maxMarks !== null) {
        this.form.controls.marks.setValidators([
          Validators.required,
          Validators.min(0),
          Validators.max(maxMarks),
        ]);

        this.form.controls.marks.updateValueAndValidity({ emitEvent: false });
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
    if (!this.submitting()) {
      this.cancelled.emit();
    }
  }
}