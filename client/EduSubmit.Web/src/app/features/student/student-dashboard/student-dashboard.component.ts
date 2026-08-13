import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { DashboardCardComponent } from '../../../shared/ui/dashboard-card/dashboard-card.component';
import { LoadingComponent } from '../../../shared/ui/loading/loading.component';
import { ErrorMessageComponent } from '../../../shared/ui/error-message/error-message.component';

import { Assignment } from '../../../core/models/assignment.model';
import { Submission } from '../../../core/models/submission.model';

import { AssignmentApiService } from '../assignments/data-access/assignment-api.service';
import { SubmissionApiService } from '../submissions/data-access/submission-api.service';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [DashboardCardComponent, LoadingComponent, ErrorMessageComponent, DatePipe],
  template: `
    <div class="dashboard-container">
      <h1 class="page-title">Student Dashboard</h1>

      @if (loading()) {
        <app-loading />
      } @else if (error(); as errorMessage) {
        <app-error-message [message]="errorMessage" />
      } @else {
        <div class="cards-grid">
          <app-dashboard-card
            icon="assignment"
            label="Available Assignments"
            [value]="counts().available"
          />

          <app-dashboard-card
            icon="submission"
            label="My Submissions"
            [value]="counts().submitted"
          />

          <app-dashboard-card icon="graded" label="Graded" [value]="counts().graded" />
        </div>

        <div class="recent-section">
          <h2>Recent Assignments</h2>

          @if (recentAssignments().length === 0) {
            <p class="empty-text">No assignments available.</p>
          } @else {
            <div class="assignment-list">
              @for (assignment of recentAssignments(); track assignment.id) {
                <div class="assignment-item">
                  <span class="assignment-title">
                    {{ assignment.title }}
                  </span>

                  <span class="assignment-deadline">
                    Due: {{ assignment.deadline | date: 'shortDate' }}
                  </span>
                </div>
              }
            </div>
          }
        </div>

        <div class="recent-section" style="margin-top: 1.5rem;">
          <h2>Recent Submissions</h2>

          @if (recentSubmissions().length === 0) {
            <p class="empty-text">No submissions yet.</p>
          } @else {
            <div class="submission-list">
              @for (submission of recentSubmissions(); track submission.id) {
                <div class="submission-item">
                  <span class="submission-assignment">
                    Assignment ID: {{ submission.assignmentId }}
                  </span>

                  <span
                    class="submission-status"
                    [class.submitted]="submission.status === 'Submitted'"
                    [class.late]="submission.status === 'Late'"
                    [class.graded]="submission.status === 'Graded'"
                    [class.returned]="submission.status === 'ReturnedForRevision'"
                  >
                    {{ submission.status }}
                  </span>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,

  styles: [
    `
      .dashboard-container {
        max-width: 1200px;
        margin: 0 auto;
      }

      .page-title {
        font-size: 1.75rem;
        font-weight: 600;
        color: #1a237e;
        margin-bottom: 2rem;
      }

      .cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2.5rem;
      }

      .recent-section {
        background: #fff;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      }

      .recent-section h2 {
        font-size: 1.2rem;
        font-weight: 600;
        color: #333;
        margin-bottom: 1rem;
      }

      .empty-text {
        color: #999;
        font-style: italic;
      }

      .assignment-list,
      .submission-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .assignment-item,
      .submission-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 1rem;
        background: #f5f5f5;
        border-radius: 8px;
      }

      .assignment-title {
        font-weight: 500;
        color: #333;
      }

      .assignment-deadline {
        font-size: 0.85rem;
        color: #777;
      }

      .submission-assignment {
        font-weight: 500;
        color: #333;
      }

      .submission-status {
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.25rem 0.75rem;
        border-radius: 16px;
        text-transform: uppercase;
      }

      .submission-status.submitted {
        background: #e3f2fd;
        color: #0d47a1;
      }

      .submission-status.late {
        background: #ffebee;
        color: #b71c1c;
      }

      .submission-status.graded {
        background: #e8f5e9;
        color: #2e7d32;
      }

      .submission-status.returned {
        background: #fff3e0;
        color: #e65100;
      }
    `,
  ],

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentDashboardComponent {
  private readonly assignmentService = inject(AssignmentApiService);
  private readonly submissionService = inject(SubmissionApiService);

  loading = signal(true);
  error = signal<string | null>(null);

  counts = signal({
    available: 0,
    submitted: 0,
    graded: 0,
  });

  recentAssignments = signal<Assignment[]>([]);
  recentSubmissions = signal<Submission[]>([]);

  constructor() {
    this.loadDashboard();
  }

  private async loadDashboard(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const [assignments, submissions] = await Promise.all([
        firstValueFrom(this.assignmentService.getStudentAssignments(1, 10)),
        firstValueFrom(this.submissionService.getMySubmissions(1, 10)),
      ]);

      const assignmentItems = assignments?.items ?? [];
      const submissionItems = submissions?.items ?? [];

      const available = assignments?.totalCount ?? assignmentItems.length;

      const submitted = submissionItems.length;

      const graded = submissionItems.filter((s: Submission) => s.status === 'Graded').length;

      this.counts.set({
        available,
        submitted,
        graded,
      });

      this.recentAssignments.set(assignmentItems.slice(0, 5));

      this.recentSubmissions.set(submissionItems.slice(0, 5));

      this.loading.set(false);
    } catch (err: unknown) {
      this.error.set('Failed to load dashboard data.');
      this.loading.set(false);
      console.error(err);
    }
  }
}
