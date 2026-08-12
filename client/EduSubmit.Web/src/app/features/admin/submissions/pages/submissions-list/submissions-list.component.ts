import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { Submission, SubmissionStatus } from '../../../../../core/models/submission.model';
import { BadgeComponent } from '../../../../../shared/ui/badge/badge.component';
import { EmptyStateComponent } from '../../../../../shared/ui/empty-state/empty-state.component';
import { LoadingComponent } from '../../../../../shared/ui/loading/loading.component';
import { PaginationComponent } from '../../../../../shared/ui/pagination/pagination.component';
import { TableColumn, TableComponent } from '../../../../../shared/ui/table/table.component';
import { ToastService } from '../../../../../shared/ui/toast/toast.service';

import { SubmissionApiService } from '../../data-access/submission-api.service';

@Component({
  selector: 'app-submissions-list',
  standalone: true,
  imports: [LoadingComponent, EmptyStateComponent, PaginationComponent, TableComponent, BadgeComponent],
  templateUrl: './submissions-list.component.html',
  styleUrl: './submissions-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubmissionsListComponent implements OnInit {
  private readonly submissionApi = inject(SubmissionApiService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly submissions = signal<Submission[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly totalCount = signal(0);
  protected readonly totalPages = signal(1);
  protected readonly hasPreviousPage = signal(false);
  protected readonly hasNextPage = signal(false);

  protected readonly columns: readonly TableColumn<Submission>[] = [
    { key: 'studentId', label: 'Student ID' },
    { key: 'assignmentId', label: 'Assignment ID' },
    { key: 'submittedAt', label: 'Submitted At' },
    { key: 'status', label: 'Status' },
    { key: 'marks', label: 'Marks' },
  ];

  ngOnInit(): void {
    this.loadSubmissions();
  }

  protected loadSubmissions(): void {
    this.loading.set(true);
    this.error.set(null);

    this.submissionApi.getSubmissions(this.currentPage(), this.pageSize()).subscribe({
      next: (response) => {
        this.submissions.set(response.items);
        this.currentPage.set(response.pageNumber);
        this.pageSize.set(response.pageSize);
        this.totalCount.set(response.totalCount);
        this.totalPages.set(response.totalPages);
        this.hasPreviousPage.set(response.hasPreviousPage);
        this.hasNextPage.set(response.hasNextPage);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load submissions. Please try again.');
        this.toast.error('Failed to load submissions. Please try again.');
      },
    });
  }

  protected onPageChanged(page: number): void {
    if (page === this.currentPage()) {
      return;
    }

    this.currentPage.set(page);
    this.loadSubmissions();
  }

  protected openSubmission(submission: Submission): void {
    this.router.navigate(['/admin/submissions', submission.id]);
  }

  protected retry(): void {
    this.loadSubmissions();
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