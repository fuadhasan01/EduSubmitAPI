import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, forkJoin, map, of } from 'rxjs';

import { LoadingComponent } from '../../../../../shared/ui/loading/loading.component';
import { EmptyStateComponent } from '../../../../../shared/ui/empty-state/empty-state.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { ToastService } from '../../../../../shared/ui/toast/toast.service';

import { ClassApiService } from '../../../../admin/classes/data-access/class-api.service';
import { SubjectApiService } from '../../../../admin/subjects/data-access/subject-api.service';

import { AssignmentApiService } from '../../data-access/assignment-api.service';
import { Assignment } from '../../../../../core/models/assignment.model';
import { SubjectDto } from '../../../../../core/models/subject.model';

interface AssignmentRow {
  id: string;
  title: string;
  className: string;
  subjectName: string;
  deadline: string;
  deadlineLabel: string;
  deadlinePassed: boolean;
  maxMarks: number;
  status: string;
}

@Component({
  selector: 'app-student-assignments-list',
  standalone: true,
  imports: [LoadingComponent, EmptyStateComponent, ButtonComponent],
  templateUrl: './assignments-list.component.html',
  styleUrl: './assignments-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignmentsListComponent implements OnInit {
  private readonly assignmentApi = inject(AssignmentApiService);
  private readonly classApi = inject(ClassApiService);
  private readonly subjectApi = inject(SubjectApiService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly assignments = signal<Assignment[]>([]);
  protected readonly loading = signal(false);
  protected readonly referenceLoading = signal(false);

  protected readonly pageNumber = signal(1);
  protected readonly pageSize = signal(9);
  protected readonly totalPages = signal(0);
  protected readonly totalCount = signal(0);

  private readonly classNames = signal<Record<string, string>>({});
  private readonly subjectNames = signal<Record<string, string>>({});

  protected readonly rows = computed<AssignmentRow[]>(() => {
    const classNames = this.classNames();
    const subjectNames = this.subjectNames();

    return this.assignments().map((assignment) => {
      const deadlinePassed = new Date(assignment.deadline).getTime() <= Date.now();

      return {
        id: assignment.id,
        title: assignment.title,
        className: classNames[assignment.classId] ?? 'Unknown class',
        subjectName: subjectNames[assignment.subjectId] ?? 'Unknown subject',
        deadline: assignment.deadline,
        deadlineLabel: new Date(assignment.deadline).toLocaleString(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
        deadlinePassed,
        maxMarks: assignment.maxMarks,
        status: assignment.status,
      };
    });
  });

  ngOnInit(): void {
    this.loadAssignments(1);
  }

  protected loadAssignments(page: number): void {
    this.loading.set(true);

    this.assignmentApi.getStudentAssignments(page, this.pageSize()).subscribe({
      next: (response) => {
        this.assignments.set(response.items);
        this.pageNumber.set(response.pageNumber);
        this.totalPages.set(response.totalPages);
        this.totalCount.set(response.totalCount);
        this.loading.set(false);
        this.loadReferenceData(response.items);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Failed to load assignments. Please try again.');
      },
    });
  }

  protected goToPage(page: number): void {
    if (page < 1 || (this.totalPages() > 0 && page > this.totalPages()) || page === this.pageNumber()) {
      return;
    }

    this.loadAssignments(page);
  }

  protected openAssignment(id: string): void {
    this.router.navigate(['/student/assignments', id]);
  }

  private loadReferenceData(assignments: Assignment[]): void {
    const classIds = [...new Set(assignments.map((a) => a.classId))];

    if (classIds.length === 0) {
      return;
    }

    this.referenceLoading.set(true);

    forkJoin({
      classes: this.classApi.getClasses(),
      subjectsByClass: forkJoin(
        classIds.map((classId) =>
          this.subjectApi.getSubjectsByClass(classId).pipe(
            map((subjects) => subjects),
            catchError(() => of([] as SubjectDto[])),
          ),
        ),
      ),
    }).subscribe({
      next: ({ classes, subjectsByClass }) => {
        const classMap: Record<string, string> = {};
        classes.forEach((c) => (classMap[c.id] = c.name));
        this.classNames.set(classMap);

        const subjectMap: Record<string, string> = {};
        subjectsByClass.flat().forEach((s) => (subjectMap[s.id] = s.name));
        this.subjectNames.set(subjectMap);

        this.referenceLoading.set(false);
      },
      error: () => {
        // Non-fatal: assignments still render, just without friendly names.
        this.referenceLoading.set(false);
      },
    });
  }
}