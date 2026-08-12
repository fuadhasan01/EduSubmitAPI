import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
  Assignment,
  UpdateAssignmentRequest,
} from '../../../../../core/models/assignment.model';
import { LoadingComponent } from '../../../../../shared/ui/loading/loading.component';
import { ToastService } from '../../../../../shared/ui/toast/toast.service';

import { AssignmentApiService } from '../../data-access/assignment-api.service';
import { AssignmentFormComponent } from '../../components/assignment-form/assignment-form.component';

@Component({
  selector: 'app-assignment-edit',
  standalone: true,
  imports: [LoadingComponent, AssignmentFormComponent],
  templateUrl: './assignment-edit.component.html',
  styleUrl: './assignment-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignmentEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly assignmentApi = inject(AssignmentApiService);
  private readonly toast = inject(ToastService);

  protected readonly assignment = signal<Assignment | null>(null);
  protected readonly loading = signal(false);
  protected readonly submitting = signal(false);
  protected readonly serverError = signal<string | null>(null);

  private assignmentId = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.serverError.set('Assignment ID is missing.');
      return;
    }

    this.assignmentId = id;
    this.loadAssignment();
  }

  private loadAssignment(): void {
    this.loading.set(true);

    this.assignmentApi.getAssignmentById(this.assignmentId).subscribe({
      next: (assignment) => {
        this.assignment.set(assignment);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.serverError.set('Failed to load assignment.');
        this.toast.error('Failed to load assignment.');
      },
    });
  }

  protected updateAssignment(request: UpdateAssignmentRequest): void {
    this.submitting.set(true);
    this.serverError.set(null);

    this.assignmentApi.updateAssignment(this.assignmentId, request).subscribe({
      next: () => {
        this.submitting.set(false);
        this.toast.success('Assignment updated successfully.');
        this.router.navigate(['/teacher/assignments', this.assignmentId]);
      },
      error: (err) => {
        this.submitting.set(false);
        this.serverError.set(
          err?.error?.detail ??
            err?.error?.title ??
            'Failed to update assignment.',
        );
      },
    });
  }

  protected cancel(): void {
    this.router.navigate(['/teacher/assignments', this.assignmentId]);
  }
}