import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { LoadingComponent } from '../../../../../shared/ui/loading/loading.component';
import { EmptyStateComponent } from '../../../../../shared/ui/empty-state/empty-state.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { ToastService } from '../../../../../shared/ui/toast/toast.service';

import { ClassApiService } from '../../../classes/data-access/class-api.service';

import { SubjectApiService } from '../../data-access/subject-api.service';
import { SubjectFormModalComponent } from '../../data-access/components/subject-form-modal/subject-form-modal.component';
import { SubjectDto } from '../../../../../core/models/subject.model';
import { ClassDto } from '../../../../../core/models/class.model';

@Component({
  selector: 'app-subjects-list',
  standalone: true,
  imports: [LoadingComponent, EmptyStateComponent, ButtonComponent, SubjectFormModalComponent],
  templateUrl: './subjects-list.component.html',
  styleUrl: './subjects-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubjectsListComponent implements OnInit {
  private readonly classApi = inject(ClassApiService);
  private readonly subjectApi = inject(SubjectApiService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly classes = signal<ClassDto[]>([]);
  protected readonly classesLoading = signal(false);

  protected readonly selectedClassId = signal<string | null>(null);
  protected readonly selectedClassName = signal<string>('');

  protected readonly subjects = signal<SubjectDto[]>([]);
  protected readonly subjectsLoading = signal(false);

  protected readonly formOpen = signal(false);
  protected readonly formSubmitting = signal(false);
  protected readonly formError = signal<string | null>(null);

  ngOnInit(): void {
    this.loadClasses();
  }

  protected loadClasses(): void {
    this.classesLoading.set(true);

    this.classApi.getClasses().subscribe({
      next: (classes) => {
        this.classes.set(classes);
        this.classesLoading.set(false);

        if (classes.length > 0 && !this.selectedClassId()) {
          this.selectClass(classes[0]);
        }
      },
      error: () => {
        this.classesLoading.set(false);
        this.toast.error('Failed to load classes. Please try again.');
      },
    });
  }

  protected selectClass(schoolClass: ClassDto): void {
    if (this.selectedClassId() === schoolClass.id) {
      return;
    }

    this.selectedClassId.set(schoolClass.id);
    this.selectedClassName.set(schoolClass.name);
    this.loadSubjects(schoolClass.id);
  }

  protected loadSubjects(classId: string): void {
    this.subjectsLoading.set(true);

    this.subjectApi.getSubjectsByClass(classId).subscribe({
      next: (subjects) => {
        this.subjects.set(subjects);
        this.subjectsLoading.set(false);
      },
      error: () => {
        this.subjectsLoading.set(false);
        this.toast.error('Failed to load subjects. Please try again.');
      },
    });
  }

  protected goToClasses(): void {
    this.router.navigateByUrl('/admin/classes');
  }

  protected openCreateForm(): void {
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected closeCreateForm(): void {
    this.formOpen.set(false);
  }

  protected createSubject(name: string): void {
    const classId = this.selectedClassId();

    if (!classId) {
      return;
    }

    this.formSubmitting.set(true);
    this.formError.set(null);

    this.subjectApi.createSubject({ name, classId }).subscribe({
      next: () => {
        this.formSubmitting.set(false);
        this.formOpen.set(false);
        this.toast.success('Subject created successfully.');
        this.loadSubjects(classId);
      },
      error: (err) => {
        this.formSubmitting.set(false);
        this.formError.set(err?.error?.detail ?? err?.error?.title ?? 'Failed to create subject.');
      },
    });
  }
}