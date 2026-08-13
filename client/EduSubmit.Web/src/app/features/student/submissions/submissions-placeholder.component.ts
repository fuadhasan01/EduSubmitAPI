import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-student-submissions-placeholder',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page">
      <header class="page__header">
        <div class="page__heading">
          <span class="eyebrow">Student · Submissions</span>
          <h1 class="page__title">Submission</h1>
        </div>
      </header>

      <p>
        Submitting for assignment <strong>{{ assignmentId }}</strong> will be available once the
        submission flow is implemented.
      </p>

      <a routerLink="/student/assignments">Back to assignments</a>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentSubmissionsPlaceholderComponent {
  private readonly route = inject(ActivatedRoute);
  protected readonly assignmentId = this.route.snapshot.paramMap.get('assignmentId');
}