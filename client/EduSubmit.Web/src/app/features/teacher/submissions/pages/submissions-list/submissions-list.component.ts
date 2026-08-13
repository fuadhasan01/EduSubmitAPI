import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { LoadingComponent } from '../../../../../shared/ui/loading/loading.component';
import { EmptyStateComponent } from '../../../../../shared/ui/empty-state/empty-state.component';
import { PaginationComponent } from '../../../../../shared/ui/pagination/pagination.component';
import { BadgeComponent } from '../../../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { ToastService } from '../../../../../shared/ui/toast/toast.service';

import { SubmissionApiService } from '../../data-access/submission-api.service';
import { Submission } from '../../../../../core/models/submission.model';
import { PaginatedResponse } from '../../../../../core/models/pagination.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-submissions-list',
  standalone: true,
  imports: [
    DatePipe,
    LoadingComponent,
    EmptyStateComponent,
    PaginationComponent,
    BadgeComponent,
    ButtonComponent,
  ],
  templateUrl: './submissions-list.component.html',
  styleUrl: './submissions-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubmissionsListComponent implements OnInit {
  private readonly submissionApi = inject(SubmissionApiService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly submissions = signal<Submission[]>([]);
  protected readonly loading = signal(false);

  protected readonly pageNumber = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly totalPages = signal(1);
  protected readonly hasPreviousPage = signal(false);
  protected readonly hasNextPage = signal(false);
  protected readonly totalCount = signal(0);

  protected readonly assignmentId = signal<string>('');

  ngOnInit(): void {
    const assignmentId = this.route.snapshot.paramMap.get('assignmentId');

    if (!assignmentId) {
      this.toast.error('Assignment was not specified.');
      return;
    }

    this.assignmentId.set(assignmentId);
    this.loadSubmissions();
  }

  protected loadSubmissions(): void {
    const assignmentId = this.assignmentId();

    if (!assignmentId) {
      return;
    }

    this.loading.set(true);

    this.submissionApi
      .getSubmissionsByAssignment(assignmentId, {
        pageNumber: this.pageNumber(),
        pageSize: this.pageSize(),
      })
      .subscribe({
        next: (response: PaginatedResponse<Submission>) => {
          this.applyResponse(response);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.toast.error('Failed to load submissions. Please try again.');
        },
      });
  }

  protected changePage(page: number): void {
    if (page === this.pageNumber()) {
      return;
    }

    this.pageNumber.set(page);
    this.loadSubmissions();
  }

  protected openSubmission(submission: Submission): void {
    this.router.navigate(['/teacher/submissions', submission.id]);
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

  private applyResponse(response: PaginatedResponse<Submission>): void {
    this.submissions.set(response.items);
    this.pageNumber.set(response.pageNumber);
    this.pageSize.set(response.pageSize);
    this.totalPages.set(response.totalPages);
    this.totalCount.set(response.totalCount);
    this.hasPreviousPage.set(response.hasPreviousPage);
    this.hasNextPage.set(response.hasNextPage);
  }
}