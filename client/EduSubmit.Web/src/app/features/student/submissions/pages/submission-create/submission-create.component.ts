import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { LoadingComponent } from '../../../../../shared/ui/loading/loading.component';
import { EmptyStateComponent } from '../../../../../shared/ui/empty-state/empty-state.component';
import { ToastService } from '../../../../../shared/ui/toast/toast.service';

import { AssignmentApiService } from '../../../assignments/data-access/assignment-api.service';
import { Assignment } from '../../../../../core/models/assignment.model';
import { SubmissionApiService } from '../../data-access/submission-api.service';
import { SubmissionFormComponent, SubmissionFormValue } from '../../components/submission-form/submission-form.component';

@Component({
  selector: 'app-submission-create',
  standalone: true,
  imports: [LoadingComponent, EmptyStateComponent, SubmissionFormComponent],
  templateUrl: './submission-create.component.html',
  styleUrl: './submission-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubmissionCreateComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly assignmentApi = inject(AssignmentApiService);
  private readonly submissionApi = inject(SubmissionApiService);
  private readonly toast = inject(ToastService);

  protected readonly assignment = signal<Assignment | null>(null);
  protected readonly loading = signal(false);
  protected readonly deadlinePassed = signal(false);
  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  private assignmentId = '';

  ngOnInit(): void {
    this.assignmentId = this.route.snapshot.paramMap.get('assignmentId') ?? '';

    if (!this.assignmentId) {
      this.router.navigateByUrl('/student/assignments');
      return;
    }

    this.loading.set(true);

    this.assignmentApi.getAssignmentById(this.assignmentId).subscribe({
      next: (assignment) => {
        this.assignment.set(assignment);
        this.deadlinePassed.set(new Date(assignment.deadline).getTime() <= Date.now());
        this.checkExistingSubmission();
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Failed to load this assignment.');
      },
    });
  }

  private checkExistingSubmission(): void {
    // No "get submission by assignment" endpoint exists, so we scan the
    // student's own submissions and redirect if one already exists.
    this.submissionApi.getMySubmissions(1, 100).subscribe({
      next: (response) => {
        const existing = response.items.find((s) => s.assignmentId === this.assignmentId);
        this.loading.set(false);

        if (existing) {
          this.router.navigate(['/student/submissions', existing.id]);
        }
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  protected createSubmission(value: SubmissionFormValue): void {
    this.submitting.set(true);
    this.submitError.set(null);

    this.submissionApi
      .createSubmission({
        assignmentId: this.assignmentId,
        content: value.content,
        fileUrl: value.fileUrl || '',
      })
      .subscribe({
        next: (created) => {
          this.submitting.set(false);
          this.toast.success('Submission sent.');
          this.router.navigate(['/student/submissions', created.id]);
        },
        error: (err) => {
          this.submitting.set(false);
          this.submitError.set(
            err?.error?.detail ?? err?.error?.title ?? 'Failed to submit. Please try again.',
          );
        },
      });
  }

  protected cancel(): void {
    this.router.navigate(['/student/assignments', this.assignmentId]);
  }
}