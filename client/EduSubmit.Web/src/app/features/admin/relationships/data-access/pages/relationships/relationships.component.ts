import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../../../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../../../../../shared/ui/empty-state/empty-state.component';
import { LoadingComponent } from '../../../../../../shared/ui/loading/loading.component';
import { ClassApiService } from '../../../../classes/data-access/class-api.service';
import { SubjectApiService } from '../../../../subjects/data-access/subject-api.service';
import { UserApiService } from '../../../../users/data-access/user-api.service';
import { RelationshipApiService } from '../../relationship-api.service';
import { ToastService } from '../../../../../../shared/ui/toast/toast.service';
import { ClassDto } from '../../../../../../core/models/class.model';
import { User, UserRole } from '../../../../../../core/models/user.model';
import { SubjectDto } from '../../../../../../core/models/subject.model';

@Component({
  selector: 'app-relationships',
  standalone: true,
  imports: [ReactiveFormsModule, LoadingComponent, EmptyStateComponent, ButtonComponent],
  templateUrl: './relationships.component.html',
  styleUrl: './relationships.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RelationshipsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly classApi = inject(ClassApiService);
  private readonly subjectApi = inject(SubjectApiService);
  private readonly userApi = inject(UserApiService);
  private readonly relationshipApi = inject(RelationshipApiService);
  private readonly toast = inject(ToastService);

  // Shared reference data
  protected readonly classes = signal<ClassDto[]>([]);
  protected readonly classesLoading = signal(false);

  protected readonly teachers = signal<User[]>([]);
  protected readonly students = signal<User[]>([]);
  protected readonly usersLoading = signal(false);

  // --- Assign teacher panel ---
  protected readonly assignClassId = signal<string | null>(null);
  protected readonly assignSubjects = signal<SubjectDto[]>([]);
  protected readonly assignSubjectsLoading = signal(false);
  protected readonly assignSubmitting = signal(false);
  protected readonly assignError = signal<string | null>(null);

  protected readonly assignForm = this.fb.nonNullable.group({
    subjectId: ['', Validators.required],
    teacherId: ['', Validators.required],
  });

  // --- Enroll student panel ---
  protected readonly enrollClassId = signal<string | null>(null);
  protected readonly enrollSubmitting = signal(false);
  protected readonly enrollError = signal<string | null>(null);

  protected readonly enrollForm = this.fb.nonNullable.group({
    studentId: ['', Validators.required],
  });

  ngOnInit(): void {
    this.loadClasses();
    this.loadUsers();
  }

  private loadClasses(): void {
    this.classesLoading.set(true);

    this.classApi.getClasses().subscribe({
      next: (classes) => {
        this.classes.set(classes);
        this.classesLoading.set(false);
      },
      error: () => {
        this.classesLoading.set(false);
        this.toast.error('Failed to load classes. Please try again.');
      },
    });
  }

  private loadUsers(): void {
    this.usersLoading.set(true);

    this.userApi.getUsers(1, 100).subscribe({
      next: (response) => {
        this.teachers.set(response.items.filter((u) => u.role === UserRole.Teacher && u.isActive));
        this.students.set(response.items.filter((u) => u.role === UserRole.Student && u.isActive));
        this.usersLoading.set(false);
      },
      error: () => {
        this.usersLoading.set(false);
        this.toast.error('Failed to load teachers and students. Please try again.');
      },
    });
  }

  // --- Assign teacher handlers ---

  protected selectAssignClass(schoolClass: ClassDto): void {
    if (this.assignClassId() === schoolClass.id) {
      return;
    }

    this.assignClassId.set(schoolClass.id);
    this.assignForm.reset({ subjectId: '', teacherId: '' });
    this.assignError.set(null);
    this.loadAssignSubjects(schoolClass.id);
  }

  private loadAssignSubjects(classId: string): void {
    this.assignSubjectsLoading.set(true);

    this.subjectApi.getSubjectsByClass(classId).subscribe({
      next: (subjects) => {
        this.assignSubjects.set(subjects);
        this.assignSubjectsLoading.set(false);
      },
      error: () => {
        this.assignSubjectsLoading.set(false);
        this.toast.error('Failed to load subjects for this class.');
      },
    });
  }

  protected submitAssignTeacher(): void {
    if (this.assignForm.invalid) {
      this.assignForm.markAllAsTouched();
      return;
    }

    const { subjectId, teacherId } = this.assignForm.getRawValue();
    const subjectName =
      this.assignSubjects().find((s) => s.id === subjectId)?.name ?? 'the subject';

    this.assignSubmitting.set(true);
    this.assignError.set(null);

    this.relationshipApi.assignTeacher(subjectId, teacherId).subscribe({
      next: () => {
        this.assignSubmitting.set(false);
        this.assignForm.reset({ subjectId: '', teacherId: '' });
        this.toast.success(`Teacher assigned to ${subjectName}.`);
      },
      error: (err) => {
        this.assignSubmitting.set(false);
        this.assignError.set(
          err?.error?.detail ?? err?.error?.title ?? 'Failed to assign teacher. Please try again.',
        );
      },
    });
  }

  // --- Enroll student handlers ---

  protected selectEnrollClass(schoolClass: ClassDto): void {
    if (this.enrollClassId() === schoolClass.id) {
      return;
    }

    this.enrollClassId.set(schoolClass.id);
    this.enrollForm.reset({ studentId: '' });
    this.enrollError.set(null);
  }

  protected submitEnrollStudent(): void {
    const classId = this.enrollClassId();

    if (!classId || this.enrollForm.invalid) {
      this.enrollForm.markAllAsTouched();
      return;
    }

    const { studentId } = this.enrollForm.getRawValue();
    const className = this.classes().find((c) => c.id === classId)?.name ?? 'the class';

    this.enrollSubmitting.set(true);
    this.enrollError.set(null);

    this.relationshipApi.enrollStudent(classId, studentId).subscribe({
      next: () => {
        this.enrollSubmitting.set(false);
        this.enrollForm.reset({ studentId: '' });
        this.toast.success(`Student enrolled in ${className}.`);
      },
      error: (err) => {
        this.enrollSubmitting.set(false);
        this.enrollError.set(
          err?.error?.detail ?? err?.error?.title ?? 'Failed to enroll student. Please try again.',
        );
      },
    });
  }
}
