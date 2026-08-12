import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { CreateAssignmentRequest } from '../../../../../core/models/assignment.model';
import { ToastService } from '../../../../../shared/ui/toast/toast.service';

import { AssignmentApiService } from '../../data-access/assignment-api.service';
import { AssignmentFormComponent } from '../../components/assignment-form/assignment-form.component';

@Component({
  selector: 'app-assignment-create',
  standalone: true,
  imports: [AssignmentFormComponent],
  templateUrl: './assignment-create.component.html',
  styleUrl: './assignment-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignmentCreateComponent {
  private readonly assignmentApi = inject(AssignmentApiService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly submitting = signal(false);
  protected readonly serverError = signal<string | null>(null);

  protected createAssignment(request: CreateAssignmentRequest): void {
    this.submitting.set(true);
    this.serverError.set(null);

    this.assignmentApi.createAssignment(request).subscribe({
      next: () => {
        this.submitting.set(false);
        this.toast.success('Assignment created successfully.');
        this.router.navigate(['/teacher/assignments']);
      },
      error: (err) => {
        this.submitting.set(false);
        this.serverError.set(
          err?.error?.detail ??
            err?.error?.title ??
            'Failed to create assignment.',
        );
      },
    });
  }

  protected cancel(): void {
    this.router.navigate(['/teacher/assignments']);
  }
}