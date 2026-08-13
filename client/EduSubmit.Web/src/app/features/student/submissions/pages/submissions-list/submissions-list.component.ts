import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';

import { LoadingComponent } from '../../../../../shared/ui/loading/loading.component';
import { EmptyStateComponent } from '../../../../../shared/ui/empty-state/empty-state.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { ToastService } from '../../../../../shared/ui/toast/toast.service';

import { AssignmentApiService } from '../../../assignments/data-access/assignment-api.service';
import { Assignment } from '../../../../../core/models/assignment.model';
import { Submission } from '../../../../../core/models/submission.model';
import { SubmissionApiService } from '../../data-access/submission-api.service';

interface SubmissionRow {
  id: string;
  assignmentTitle: string;
  submittedAt: string;
  status: string;
  marks: number | null;
  maxMarks: number | null;
}

@Component({
  selector: 'app-submissions-list',
  standalone: true,
  imports: [LoadingComponent, EmptyStateComponent, ButtonComponent],
  templateUrl: './submissions-list.component.html',
  styleUrl: './submissions-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubmissionsListComponent implements OnInit {
  private readonly submissionApi = inject(SubmissionApiService);
  private readonly assignmentApi = inject(AssignmentApiService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly submissions = signal<Submission[]>([]);
  protected readonly loading = signal(false);

  protected readonly pageNumber = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly totalPages = signal(0);
  protected readonly totalCount = signal(0);

  private readonly assignmentById = signal<Record<string, Assignment>>({});

  protected readonly rows = computed<SubmissionRow[]>(() => {
    const assignments = this.assignmentById();

    return this.submissions().map((s) => ({
      id: s.id,
      assignmentTitle: assignments[s.assignmentId]?.title ?? 'Assignment',
      submittedAt: new Date(s.submittedAt).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      status: s.status,
      marks: s.marks,
      maxMarks: assignments[s.assignmentId]?.maxMarks ?? null,
    }));
  });

  ngOnInit(): void {
    this.loadSubmissions(1);
  }

  protected loadSubmissions(page: number): void {
    this.loading.set(true);

    this.submissionApi.getMySubmissions(page, this.pageSize()).subscribe({
      next: (response) => {
        this.submissions.set(response.items);
        this.pageNumber.set(response.pageNumber);
        this.totalPages.set(response.totalPages);
        this.totalCount.set(response.totalCount);
        this.loading.set(false);
        this.loadAssignmentTitles(response.items);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Failed to load your submissions. Please try again.');
      },
    });
  }

  protected goToPage(page: number): void {
    if (page < 1 || (this.totalPages() > 0 && page > this.totalPages()) || page === this.pageNumber()) {
      return;
    }

    this.loadSubmissions(page);
  }

  protected openSubmission(id: string): void {
    this.router.navigate(['/student/submissions', id]);
  }

  private loadAssignmentTitles(submissions: Submission[]): void {
    const ids = [...new Set(submissions.map((s) => s.assignmentId))];

    if (ids.length === 0) {
      return;
    }

    forkJoin(
      ids.map((id) =>
        this.assignmentApi.getAssignmentById(id).pipe(catchError(() => of(null))),
      ),
    ).subscribe((results) => {
      const map: Record<string, Assignment> = {};
      results.forEach((a) => {
        if (a) {
          map[a.id] = a;
        }
      });
      this.assignmentById.set(map);
    });
  }
}