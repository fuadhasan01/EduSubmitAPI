// src/app/features/admin/admin-dashboard/admin-dashboard.component.ts

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DashboardCardComponent } from '../../../shared/ui/dashboard-card/dashboard-card.component';
import { LoadingComponent } from '../../../shared/ui/loading/loading.component';
import { ErrorMessageComponent } from '../../../shared/ui/error-message/error-message.component';
import { UserApiService } from '../users/data-access/user-api.service';
import { ClassApiService } from '../classes/data-access/class-api.service';
import { SubjectApiService } from '../subjects/data-access/subject-api.service';
import { SubmissionApiService } from '../submissions/data-access/submission-api.service';
import { AssignmentApiService } from '../assignments/data-access/assignment-api.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [DashboardCardComponent, LoadingComponent, ErrorMessageComponent],
  template: `
    <div class="dashboard-container">
      <h1 class="page-title">Admin Dashboard</h1>

      @if (loading()) {
        <app-loading />
      } @else if (error(); as errorMessage) {
        <app-error-message [message]="errorMessage" />
      } @else {
        <div class="cards-grid">
          <app-dashboard-card icon="people" label="Users" [value]="counts().users" />
          <app-dashboard-card icon="class" label="Classes" [value]="counts().classes" />
          <app-dashboard-card icon="subject" label="Subjects" [value]="counts().subjects" />
          <app-dashboard-card
            icon="assignment"
            label="Assignments"
            [value]="counts().assignments"
          />
          <app-dashboard-card
            icon="assignment_turned_in"
            label="Submissions"
            [value]="counts().submissions"
          />
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
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {
  private userService = inject(UserApiService);
  private classService = inject(ClassApiService);
  private subjectService = inject(SubjectApiService);
  private assignmentService = inject(AssignmentApiService);
  private submissionService = inject(SubmissionApiService);

  loading = signal(true);
  error = signal<string | null>(null);
  counts = signal({ users: 0, classes: 0, subjects: 0, assignments: 0, submissions: 0 });

  constructor() {
    this.loadDashboard();
  }

  private async loadDashboard(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      // 1. Fetch users, assignments, submissions (paginated, need totalCount)
      const [usersResponse, assignmentsResponse, submissionsResponse] = await Promise.all([
        firstValueFrom(this.userService.getUsers(1, 1)),
        firstValueFrom(this.assignmentService.getAssignments(1, 1)),
        firstValueFrom(this.submissionService.getSubmissions(1, 1)),
      ]);

      // 2. Fetch all classes (array)
      const classes = await firstValueFrom(this.classService.getClasses());

      // 3. Fetch subjects for each class and sum counts
      let totalSubjects = 0;
      if (classes.length > 0) {
        const subjectRequests = classes.map((cls) =>
          firstValueFrom(this.subjectService.getSubjectsByClass(cls.id)),
        );
        const subjectResponses = await Promise.all(subjectRequests);
        totalSubjects = subjectResponses.reduce((sum, subs) => sum + subs.length, 0);
      }

      this.counts.set({
        users: usersResponse.totalCount,
        classes: classes.length,
        subjects: totalSubjects,
        assignments: assignmentsResponse.totalCount,
        submissions: submissionsResponse.totalCount,
      });
    } catch (error) {
      this.error.set('Failed to load dashboard data. Please try again.');
      console.error('Dashboard error:', error);
    } finally {
      this.loading.set(false);
    }
  }
}
