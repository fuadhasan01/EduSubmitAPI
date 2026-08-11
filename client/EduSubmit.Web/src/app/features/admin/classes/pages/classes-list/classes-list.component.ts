import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';

import { LoadingComponent } from '../../../../../shared/ui/loading/loading.component';
import { EmptyStateComponent } from '../../../../../shared/ui/empty-state/empty-state.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { ToastService } from '../../../../../shared/ui/toast/toast.service';

import { ClassApiService } from '../../data-access/class-api.service';
import { ClassFormModalComponent } from '../../components/class-form-modal/class-form-modal.component';
import { ClassDto, CreateClassRequest } from '../../../../../core/models/class.model';

@Component({
  selector: 'app-classes-list',
  standalone: true,
  imports: [LoadingComponent, EmptyStateComponent, ButtonComponent, ClassFormModalComponent],
  templateUrl: './classes-list.component.html',
  styleUrl: './classes-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassesListComponent implements OnInit {
  private readonly classApi = inject(ClassApiService);
  private readonly toast = inject(ToastService);

  protected readonly classes = signal<ClassDto[]>([]);
  protected readonly loading = signal(false);

  protected readonly formOpen = signal(false);
  protected readonly formSubmitting = signal(false);
  protected readonly formError = signal<string | null>(null);

  ngOnInit(): void {
    console.log('🔥 ClassesListComponent loaded');

    this.loadClasses();
  }

  protected loadClasses(): void {
    this.loading.set(true);

    this.classApi.getClasses().subscribe({
      next: (classes) => {
        this.classes.set(classes);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Failed to load classes. Please try again.');
      },
    });
  }

  protected openCreateForm(): void {
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected closeCreateForm(): void {
    this.formOpen.set(false);
  }

  protected createClass(request: CreateClassRequest): void {
    this.formSubmitting.set(true);
    this.formError.set(null);

    this.classApi.createClass(request).subscribe({
      next: () => {
        this.formSubmitting.set(false);
        this.formOpen.set(false);
        this.toast.success('Class created successfully.');
        this.loadClasses();
      },
      error: (err) => {
        this.formSubmitting.set(false);
        this.formError.set(err?.error?.detail ?? err?.error?.title ?? 'Failed to create class.');
      },
    });
  }
}
