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
      <div class="dashboard-header">
        <div>
          <span class="eyebrow">Overview</span>
          <h1 class="page-title">Student Dashboard</h1>
        </div>

        <div class="header-pill">
          <span class="material-icons">school</span>
          Learning progress
        </div>
      </div>

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
            icon="upload_file"
            label="My Submissions"
            [value]="counts().submitted"
          />

          <app-dashboard-card icon="verified" label="Graded" [value]="counts().graded" />
        </div>

        <div class="recent-section">
          <div class="section-header">
            <h2>Recent Assignments</h2>
            <span class="section-meta">Latest 5</span>
          </div>

          @if (recentAssignments().length === 0) {
            <div class="empty-state">
              <span class="material-icons">assignment_turned_in</span>
              <p>No assignments available yet.</p>
            </div>
          } @else {
            <div class="assignment-list">
              @for (assignment of recentAssignments(); track assignment.id) {
                <div class="assignment-item">
                  <div class="assignment-main">
                    <span class="assignment-title">{{ assignment.title }}</span>
                    <span class="assignment-meta">
                      Due {{ assignment.deadline | date: 'mediumDate' }}
                    </span>
                  </div>

                  <span class="assignment-deadline">
                    {{ assignment.status }}
                  </span>
                </div>
              }
            </div>
          }
        </div>

        <div class="recent-section recent-section--secondary">
          <div class="section-header">
            <h2>Recent Submissions</h2>
            <span class="section-meta">Activity</span>
          </div>

          @if (recentSubmissions().length === 0) {
            <div class="empty-state">
              <span class="material-icons">task_alt</span>
              <p>No submissions yet. Start with your first assignment.</p>
            </div>
          } @else {
            <div class="submission-list">
              @for (submission of recentSubmissions(); track submission.id) {
                <div class="submission-item">
                  <div class="submission-main">
                    <span class="submission-assignment"
                      >Assignment {{ submission.assignmentId }}</span
                    >
                    <span class="submission-meta">
                      {{ submission.submittedAt | date: 'mediumDate' }}
                    </span>
                  </div>

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
        padding: 0.5rem 0 2rem;
      }

      .dashboard-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .eyebrow {
        display: inline-block;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #5c6bc0;
        margin-bottom: 0.5rem;
      }

      .page-title {
        font-size: clamp(2rem, 2.3vw, 2.5rem);
        font-weight: 700;
        color: #1a237e;
        margin: 0;
      }

      .header-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.7rem 1rem;
        border-radius: 999px;
        background: linear-gradient(135deg, #eef2ff 0%, #e8f1ff 100%);
        border: 1px solid rgba(92, 107, 192, 0.12);
        color: #3949ab;
        font-weight: 600;
        box-shadow: 0 6px 18px rgba(92, 107, 192, 0.08);
      }

      .header-pill .material-icons {
        font-size: 18px;
      }

      .cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .recent-section {
        background: rgba(255, 255, 255, 0.82);
        border: 1px solid rgba(148, 163, 184, 0.15);
        border-radius: 18px;
        padding: 1.5rem;
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
      }

      .recent-section--secondary {
        margin-top: 1.5rem;
      }

      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .recent-section h2 {
        font-size: 1.15rem;
        font-weight: 700;
        color: #1f2937;
        margin: 0;
      }

      .section-meta {
        font-size: 0.74rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #64748b;
      }

      .empty-state {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1.5rem 1rem;
        border: 1px dashed rgba(148, 163, 184, 0.4);
        border-radius: 12px;
        background: rgba(248, 250, 252, 0.7);
        color: #475569;
      }

      .empty-state .material-icons {
        color: #94a3b8;
      }

      .empty-state p {
        margin: 0;
        font-weight: 500;
      }

      .assignment-list,
      .submission-list {
        display: flex;
        flex-direction: column;
        gap: 0.9rem;
      }

      .assignment-item,
      .submission-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 1rem 1.1rem;
        border-radius: 14px;
        background: linear-gradient(180deg, #f8fafc 0%, #f3f6ff 100%);
        border: 1px solid rgba(148, 163, 184, 0.18);
      }

      .assignment-main,
      .submission-main {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }

      .assignment-title,
      .submission-assignment {
        font-weight: 600;
        color: #1f2937;
      }

      .assignment-meta,
      .submission-meta {
        margin-top: 0.25rem;
        font-size: 0.8rem;
        color: #64748b;
      }

      .assignment-deadline,
      .submission-status {
        font-size: 0.75rem;
        font-weight: 700;
        padding: 0.35rem 0.7rem;
        border-radius: 999px;
        white-space: nowrap;
      }

      .assignment-deadline {
        background: #eef2ff;
        color: #4f46e5;
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
