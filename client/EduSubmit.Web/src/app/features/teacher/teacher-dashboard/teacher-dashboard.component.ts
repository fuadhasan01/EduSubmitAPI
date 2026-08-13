import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DashboardCardComponent } from '../../../shared/ui/dashboard-card/dashboard-card.component';
import { Assignment } from '../../../core/models/assignment.model';
import { LoadingComponent } from '../../../shared/ui/loading/loading.component';
import { ErrorMessageComponent } from '../../../shared/ui/error-message/error-message.component';
import { AssignmentApiService } from '../assignments/data-access/assignment-api.service';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [DashboardCardComponent, LoadingComponent, ErrorMessageComponent],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <div>
          <span class="eyebrow">Overview</span>
          <h1 class="page-title">Teacher Dashboard</h1>
        </div>

        <div class="header-pill">
          <span class="material-icons">insights</span>
          Live overview
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
            label="Total Assignments"
            [value]="counts().total"
          />
          <app-dashboard-card icon="drafts" label="Draft" [value]="counts().draft" />
          <app-dashboard-card icon="publish" label="Published" [value]="counts().published" />
        </div>

        <div class="recent-section">
          <div class="section-header">
            <h2>Recent Assignments</h2>
            <span class="section-meta">Latest 5</span>
          </div>

          @if (recentAssignments().length === 0) {
            <div class="empty-state">
              <span class="material-icons">assignment_turned_in</span>
              <p>No assignments created yet.</p>
            </div>
          } @else {
            <div class="assignment-list">
              @for (assignment of recentAssignments(); track assignment.id) {
                <div class="assignment-item">
                  <div class="assignment-main">
                    <span class="assignment-title">{{ assignment.title }}</span>
                    <span class="assignment-meta">
                      {{ assignment.subjectName || 'Subject' }} •
                      {{ assignment.className || 'Class' }}
                    </span>
                  </div>

                  <span
                    class="assignment-status"
                    [class.draft]="assignment.status === 'Draft'"
                    [class.published]="assignment.status === 'Published'"
                  >
                    {{ assignment.status }}
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

      .assignment-list {
        display: flex;
        flex-direction: column;
        gap: 0.9rem;
      }

      .assignment-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 1rem 1.1rem;
        border-radius: 14px;
        background: linear-gradient(180deg, #f8fafc 0%, #f3f6ff 100%);
        border: 1px solid rgba(148, 163, 184, 0.18);
      }

      .assignment-main {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }

      .assignment-title {
        font-weight: 600;
        color: #1f2937;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .assignment-meta {
        margin-top: 0.25rem;
        font-size: 0.85rem;
        color: #64748b;
      }

      .assignment-status {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 96px;
        padding: 0.45rem 0.8rem;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      .assignment-status.draft {
        background: #fff3e0;
        color: #e65100;
      }

      .assignment-status.published {
        background: #e8f5e9;
        color: #2e7d32;
      }

      @media (max-width: 640px) {
        .dashboard-header {
          flex-direction: column;
          align-items: flex-start;
        }

        .assignment-item {
          flex-direction: column;
          align-items: flex-start;
        }

        .assignment-status {
          min-width: auto;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherDashboardComponent {
  private assignmentService = inject(AssignmentApiService);

  loading = signal(true);
  error = signal<string | null>(null);
  counts = signal({ total: 0, draft: 0, published: 0 });
  recentAssignments = signal<Assignment[]>([]);

  constructor() {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.loading.set(true);
    this.error.set(null);

    // Fetch first page (5 assignments) to compute stats and show recent.
    this.assignmentService.getTeacherAssignments(1, 10).subscribe({
      next: (response) => {
        const items = response.items ?? [];
        const total = response.totalCount ?? items.length;
        const draft = items.filter((a) => a.status === 'Draft').length;
        const published = items.filter((a) => a.status === 'Published').length;

        this.counts.set({ total, draft, published });
        this.recentAssignments.set(items.slice(0, 5));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load dashboard data.');
        this.loading.set(false);
        console.error(err);
      },
    });
  }
}
