import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Submission, SubmissionStatus } from '../../../../../core/models/submission.model';
import { BadgeComponent } from '../../../../../shared/ui/badge/badge.component';
import { LoadingComponent } from '../../../../../shared/ui/loading/loading.component';
import { ToastService } from '../../../../../shared/ui/toast/toast.service';

import { SubmissionApiService } from '../../data-access/submission-api.service';

@Component({
  selector: 'app-submission-detail',
  standalone: true,
  imports: [DatePipe, LoadingComponent, BadgeComponent],
  templateUrl: './submission-detail.component.html',
  styleUrl: './submission-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubmissionDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly submissionApi = inject(SubmissionApiService);
  private readonly toast = inject(ToastService);

  protected readonly submission = signal<Submission | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('Submission ID is missing.');
      return;
    }

    this.loadSubmission(id);
  }

  private loadSubmission(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.submissionApi.getSubmissionById(id).subscribe({
      next: (submission) => {
        this.submission.set(submission);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load submission details.');
        this.toast.error('Failed to load submission details.');
      },
    });
  }

  protected goBack(): void {
    this.router.navigate(['/admin/submissions']);
  }

  protected retry(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.loadSubmission(id);
    }
  }

  protected getStatusVariant(
    status: string,
  ): 'default' | 'success' | 'warning' | 'danger' | 'info' {
    switch (status) {
      case SubmissionStatus.Graded:
        return 'success';
      case SubmissionStatus.Late:
        return 'danger';
      case SubmissionStatus.ReturnedForRevision:
        return 'warning';
      case SubmissionStatus.Submitted:
        return 'info';
      default:
        return 'default';
    }
  }
}