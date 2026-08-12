import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../../../../shared/ui/form-field/form-field.component';
import { Assignment, CreateAssignmentRequest, UpdateAssignmentRequest } from '../../../../../core/models/assignment.model';

@Component({
  selector: 'app-assignment-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, FormFieldComponent],
  templateUrl: './assignment-form.component.html',
  styleUrl: './assignment-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignmentFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly mode = input<'create' | 'edit'>('create');
  readonly assignment = input<Assignment | null>(null);
  readonly submitting = input(false);
  readonly serverError = input<string | null>(null);

  readonly createSubmitted = output<CreateAssignmentRequest>();
    readonly updateSubmitted = output<UpdateAssignmentRequest>();
    readonly cancelled = output<void>();

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
    description: ['', [Validators.required, Validators.maxLength(5000)]],
    subjectId: ['', [Validators.required]],
    classId: ['', [Validators.required]],
    deadline: ['', [Validators.required]],
    maxMarks: [100, [Validators.required, Validators.min(1)]],
    publishImmediately: [false],
  });

  constructor() {
    effect(() => {
      const mode = this.mode();
      const assignment = this.assignment();

      if (mode === 'edit' && assignment) {
        this.form.patchValue({
          title: assignment.title,
          description: assignment.description,
          subjectId: assignment.subjectId,
          classId: assignment.classId,
          deadline: this.toDateTimeLocal(assignment.deadline),
          maxMarks: assignment.maxMarks,
          publishImmediately: false,
        });
      } else if (mode === 'create') {
        this.form.reset({
          title: '',
          description: '',
          subjectId: '',
          classId: '',
          deadline: '',
          maxMarks: 100,
          publishImmediately: false,
        });
      }
    });
  }

  protected onSubmit(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const value = this.form.getRawValue();

  if (this.mode() === 'create') {
    this.createSubmitted.emit({
      title: value.title.trim(),
      description: value.description.trim(),
      subjectId: value.subjectId,
      classId: value.classId,
      deadline: this.toIsoString(value.deadline),
      maxMarks: value.maxMarks,
      publishImmediately: value.publishImmediately,
    });

    return;
  }

  this.updateSubmitted.emit({
    title: value.title.trim(),
    description: value.description.trim(),
    subjectId: value.subjectId,
    classId: value.classId,
    deadline: this.toIsoString(value.deadline),
    maxMarks: value.maxMarks,
  });
}

  protected cancel(): void {
    this.cancelled.emit();
  }

  private toDateTimeLocal(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const offset = date.getTimezoneOffset() * 60000;

    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  }

  private toIsoString(value: string): string {
    return new Date(value).toISOString();
  }
}