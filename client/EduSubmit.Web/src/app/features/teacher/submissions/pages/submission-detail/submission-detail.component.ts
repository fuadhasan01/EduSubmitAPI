import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Location, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { LoadingComponent } from '../../../../../shared/ui/loading/loading.component';
import { BadgeComponent } from '../../../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { ToastService } from '../../../../../shared/ui/toast/toast.service';
import { ModalComponent } from '../../../../../shared/ui/modal/modal.component';

import { SubmissionApiService } from '../../data-access/submission-api.service';
import {
  GradeSubmissionRequest,
  ReturnSubmissionForRevisionRequest,
  Submission,
} from '../../../../../core/models/submission.model';
import { GradeSubmissionModalComponent } from '../../components/grade-submission-modal/grade-submission-modal.component';

@Component({
  selector: 'app-submission-detail',
  standalone: true,
  imports: [
    DatePipe,
    LoadingComponent,
    BadgeComponent,
    ButtonComponent,
    ModalComponent,
    GradeSubmissionModalComponent,
  ],
  templateUrl: './submission-detail.component.html',
  styleUrl: './submission-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubmissionDetailComponent implements OnInit {
  private readonly submissionApi = inject(SubmissionApiService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);

  protected readonly submission = signal<Submission | null>(null);
  protected readonly loading = signal(false);

  protected readonly gradeModalOpen = signal(false);
  protected readonly grading = signal(false);
  protected readonly gradeError = signal<string | null>(null);

  protected readonly returnModalOpen = signal(false);
  protected readonly returning = signal(false);
  protected readonly returnFeedback = signal('');
  protected readonly returnError = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.toast.error('Submission was not found.');
      return;
    }

    this.loadSubmission(id);
  }

  protected loadSubmission(id: string): void {
    this.loading.set(true);

    this.submissionApi.getSubmission(id).subscribe({
      next: (submission) => {
        this.submission.set(submission);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Failed to load submission.');
      },
    });
  }

  protected goBack(): void {
    this.location.back();
  }

  protected openGradeModal(): void {
    this.gradeError.set(null);
    this.gradeModalOpen.set(true);
  }

  protected closeGradeModal(): void {
    if (!this.grading()) {
      this.gradeModalOpen.set(false);
    }
  }

  protected gradeSubmission(request: GradeSubmissionRequest): void {
    const submission = this.submission();

    if (!submission) {
      return;
    }

    this.grading.set(true);
    this.gradeError.set(null);

    this.submissionApi.gradeSubmission(submission.id, request).subscribe({
      next: () => {
        this.grading.set(false);
        this.gradeModalOpen.set(false);
        this.toast.success('Submission graded successfully.');
        this.loadSubmission(submission.id);
      },
      error: (err) => {
        this.grading.set(false);
        this.gradeError.set(
          err?.error?.detail ?? err?.error?.title ?? 'Failed to grade submission.',
        );
      },
    });
  }

  protected openReturnConfirmation(): void {
    this.returnError.set(null);
    this.returnFeedback.set('');
    this.returnModalOpen.set(true);
  }

  protected closeReturnConfirmation(): void {
    if (!this.returning()) {
      this.returnModalOpen.set(false);
    }
  }

  protected updateReturnFeedback(event: Event): void {
    this.returnFeedback.set((event.target as HTMLTextAreaElement).value);
  }

  protected returnForRevision(): void {
    const submission = this.submission();
    const feedback = this.returnFeedback().trim();

    if (!submission || !feedback) {
      this.returnError.set('Feedback is required.');
      return;
    }

    const request: ReturnSubmissionForRevisionRequest = {
      feedback,
    };

    this.returning.set(true);
    this.returnError.set(null);

    this.submissionApi.returnForRevision(submission.id, request).subscribe({
      next: () => {
        this.returning.set(false);
        this.returnModalOpen.set(false);
        this.toast.success('Submission returned for revision.');
        this.loadSubmission(submission.id);
      },
      error: (err) => {
        this.returning.set(false);
        this.returnError.set(
          err?.error?.detail ?? err?.error?.title ?? 'Failed to return submission.',
        );
      },
    });
  }

  protected statusVariant(status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' {
    switch (status) {
      case 'Graded':
        return 'success';
      case 'Late':
        return 'danger';
      case 'ReturnedForRevision':
        return 'warning';
      case 'Submitted':
        return 'info';
      default:
        return 'default';
    }
  }

  protected canGrade(): boolean {
    const status = this.submission()?.status;

    return status === 'Submitted' || status === 'Late';
  }

  protected canReturnForRevision(): boolean {
    const status = this.submission()?.status;

    return status === 'Submitted' || status === 'Late';
  }
}