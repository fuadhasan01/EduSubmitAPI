import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { LoadingComponent } from '../../../../../shared/ui/loading/loading.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../../../../shared/ui/empty-state/empty-state.component';
import { ToastService } from '../../../../../shared/ui/toast/toast.service';

import { ClassApiService } from '../../../../admin/classes/data-access/class-api.service';
import { SubjectApiService } from '../../../../admin/subjects/data-access/subject-api.service';

import { AssignmentApiService } from '../../data-access/assignment-api.service';
import { Assignment } from '../../../../../core/models/assignment.model';

@Component({
  selector: 'app-assignment-detail',
  standalone: true,
  imports: [LoadingComponent, ButtonComponent, EmptyStateComponent],
  templateUrl: './assignment-detail.component.html',
  styleUrl: './assignment-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignmentDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly assignmentApi = inject(AssignmentApiService);
  private readonly classApi = inject(ClassApiService);
  private readonly subjectApi = inject(SubjectApiService);
  private readonly toast = inject(ToastService);

  protected readonly assignment = signal<Assignment | null>(null);
  protected readonly className = signal<string>('');
  protected readonly subjectName = signal<string>('');
  protected readonly loading = signal(false);
  protected readonly notFound = signal(false);

  protected readonly deadlinePassed = signal(false);
  protected readonly deadlineLabel = signal('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.notFound.set(true);
      return;
    }

    this.loadAssignment(id);
  }

  private loadAssignment(id: string): void {
    this.loading.set(true);

    this.assignmentApi.getAssignmentById(id).subscribe({
      next: (assignment) => {
        this.assignment.set(assignment);
        this.deadlinePassed.set(new Date(assignment.deadline).getTime() <= Date.now());
        this.deadlineLabel.set(
          new Date(assignment.deadline).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
          }),
        );
        this.loading.set(false);
        this.loadReferenceData(assignment.classId, assignment.subjectId);
      },
      error: () => {
        this.loading.set(false);
        this.notFound.set(true);
        this.toast.error('Failed to load this assignment.');
      },
    });
  }

  private loadReferenceData(classId: string, subjectId: string): void {
    forkJoin({
      classes: this.classApi.getClasses(),
      subjects: this.subjectApi.getSubjectsByClass(classId),
    }).subscribe({
      next: ({ classes, subjects }) => {
        this.className.set(classes.find((c) => c.id === classId)?.name ?? 'Unknown class');
        this.subjectName.set(subjects.find((s) => s.id === subjectId)?.name ?? 'Unknown subject');
      },
      error: () => {
        // Non-fatal: detail still renders without friendly names.
      },
    });
  }

  protected goBack(): void {
    this.router.navigateByUrl('/student/assignments');
  }

  protected goToSubmission(): void {
    const assignment = this.assignment();

    if (!assignment) {
      return;
    }

    this.router.navigate(['/student/submissions/new', assignment.id]);
  }
}