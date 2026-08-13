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
      <h1 class="page-title">Teacher Dashboard</h1>

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
          <app-dashboard-card icon="draft" label="Draft" [value]="counts().draft" />
          <app-dashboard-card icon="published" label="Published" [value]="counts().published" />
        </div>

        <div class="recent-section">
          <h2>Recent Assignments</h2>
          @if (recentAssignments().length === 0) {
            <p class="empty-text">No assignments created yet.</p>
          } @else {
            <div class="assignment-list">
              @for (assignment of recentAssignments(); track assignment.id) {
                <div class="assignment-item">
                  <span class="assignment-title">{{ assignment.title }}</span>
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
      .assignment-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .assignment-item {
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
      .assignment-status {
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.25rem 0.75rem;
        border-radius: 16px;
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
