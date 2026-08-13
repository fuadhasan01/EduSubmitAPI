import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../../../../shared/ui/form-field/form-field.component';
import {
  Assignment,
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
} from '../../../../../core/models/assignment.model';
import { ClassApiService } from '../../../../admin/classes/data-access/class-api.service';
import { SubjectApiService } from '../../../../admin/subjects/data-access/subject-api.service';
import { ClassDto } from '../../../../../core/models/class.model';
import { SubjectDto } from '../../../../../core/models/subject.model';

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
  private readonly classApi = inject(ClassApiService);
  private readonly subjectApi = inject(SubjectApiService);

  readonly mode = input<'create' | 'edit'>('create');
  readonly assignment = input<Assignment | null>(null);
  readonly submitting = input(false);
  readonly serverError = input<string | null>(null);

  readonly createSubmitted = output<CreateAssignmentRequest>();
  readonly updateSubmitted = output<UpdateAssignmentRequest>();
  readonly cancelled = output<void>();

  protected readonly classes = signal<ClassDto[]>([]);
  protected readonly subjects = signal<SubjectDto[]>([]);

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
    this.loadClasses();

    this.form.controls.classId.valueChanges.subscribe((classId: string | null) => {
      if (!classId) {
        this.subjects.set([]);
        this.form.patchValue({ subjectId: '' }, { emitEvent: false });
        return;
      }

      this.loadSubjects(classId);
    });

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
        this.loadSubjects(assignment.classId);
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
        this.subjects.set([]);
      }
    });
  }

  private loadClasses(): void {
    this.classApi.getClasses().subscribe({
      next: (classes: ClassDto[]) => {
        this.classes.set(classes);
      },
      error: () => {
        this.classes.set([]);
      },
    });
  }

  private loadSubjects(classId: string): void {
    this.subjectApi.getSubjectsByClass(classId).subscribe({
      next: (subjects: SubjectDto[]) => {
        this.subjects.set(subjects);

        const currentSubjectId = this.form.controls.subjectId.value;

        if (
          !currentSubjectId ||
          !subjects.some((subject: SubjectDto) => subject.id === currentSubjectId)
        ) {
          this.form.patchValue({ subjectId: '' }, { emitEvent: false });
        }
      },
      error: () => {
        this.subjects.set([]);
        this.form.patchValue({ subjectId: '' }, { emitEvent: false });
      },
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
