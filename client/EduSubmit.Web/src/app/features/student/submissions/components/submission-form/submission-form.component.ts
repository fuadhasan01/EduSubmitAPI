import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ButtonComponent } from '../../../../../shared/ui/button/button.component';

export interface SubmissionFormValue {
  content: string;
  fileUrl: string;
}

@Component({
  selector: 'app-submission-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent],
  templateUrl: './submission-form.component.html',
  styleUrl: './submission-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubmissionFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly initialContent = input('');
  readonly initialFileUrl = input('');
  readonly submitLabel = input('Submit');
  readonly submittingLabel = input('Submitting...');
  readonly submitting = input(false);
  readonly serverError = input<string | null>(null);

  readonly submitted = output<SubmissionFormValue>();
  readonly cancelled = output<void>();

  protected readonly form = this.fb.nonNullable.group({
    content: ['', [Validators.required, Validators.minLength(10)]],
    fileUrl: ['', [Validators.pattern(/^https?:\/\/.+/)]],
  });

  constructor() {
    effect(() => {
      this.form.patchValue(
        { content: this.initialContent(), fileUrl: this.initialFileUrl() },
        { emitEvent: false },
      );
    });
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit(this.form.getRawValue());
  }
}