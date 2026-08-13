import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { LoadingComponent } from '../../../../../shared/ui/loading/loading.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../../../../shared/ui/empty-state/empty-state.component';
import { ToastService } from '../../../../../shared/ui/toast/toast.service';

import { AssignmentApiService } from '../../../assignments/data-access/assignment-api.service';
import { Assignment } from '../../../../../core/models/assignment.model';
import { Submission, UpdateSubmissionRequest } from '../../../../../core/models/submission.model';
import { SubmissionApiService } from '../../data-access/submission-api.service';
import { SubmissionFormComponent, SubmissionFormValue } from '../../components/submission-form/submission-form.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-submission-detail',
  standalone: true,
  imports: [DatePipe, LoadingComponent, ButtonComponent, EmptyStateComponent, SubmissionFormComponent],
  templateUrl: './submission-detail.component.html',
  styleUrl: './submission-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubmissionDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly submissionApi = inject(SubmissionApiService);
  private readonly assignmentApi = inject(AssignmentApiService);
  private readonly toast = inject(ToastService);

  protected readonly submission = signal<Submission | null>(null);
  protected readonly assignment = signal<Assignment | null>(null);
  protected readonly loading = signal(false);
  protected readonly notFound = signal(false);

  protected readonly editing = signal(false);
  protected readonly saving = signal(false);
  protected readonly saveError = signal<string | null>(null);

  protected readonly canEdit = computed(() => {
    const submission = this.submission();
    const assignment = this.assignment();

    if (!submission || !assignment) {
      return false;
    }

    const deadlineOpen = new Date(assignment.deadline).getTime() > Date.now();
    return deadlineOpen && submission.status !== 'Graded';
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.notFound.set(true);
      return;
    }

    this.loadSubmission(id);
  }

  private loadSubmission(id: string): void {
    this.loading.set(true);

    this.submissionApi.getSubmissionById(id).subscribe({
      next: (submission) => {
        this.submission.set(submission);
        this.assignmentApi.getAssignmentById(submission.assignmentId).subscribe({
          next: (assignment) => {
            this.assignment.set(assignment);
            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
          },
        });
      },
      error: () => {
        this.loading.set(false);
        this.notFound.set(true);
        this.toast.error('Failed to load this submission.');
      },
    });
  }

  protected startEditing(): void {
    this.saveError.set(null);
    this.editing.set(true);
  }

  protected cancelEditing(): void {
    this.editing.set(false);
  }

  protected saveEdit(value: SubmissionFormValue): void {
  const submission = this.submission();

  if (!submission) {
    return;
  }

  this.saving.set(true);
  this.saveError.set(null);

  const request: UpdateSubmissionRequest = {
    submissionId: submission.id,
    content: value.content,
    fileUrl: value.fileUrl || '',
  };

  this.submissionApi
        .updateSubmission(submission.id, request)
        .subscribe({
        next: (updated) => {
            this.submission.set(updated);
            this.saving.set(false);
            this.editing.set(false);
            this.toast.success('Submission updated.');
        },
        error: (err) => {
            this.saving.set(false);
            this.saveError.set(
            err?.error?.detail ??
                err?.error?.title ??
                'Failed to update submission. Please try again.',
            );
        },
        });
    }

  protected goToList(): void {
    this.router.navigateByUrl('/student/submissions');
  }
}