import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Assignment, AssignmentStatus } from '../../../../../core/models/assignment.model';
import { ClassDto } from '../../../../../core/models/class.model';
import { SubjectDto } from '../../../../../core/models/subject.model';
import { BadgeComponent } from '../../../../../shared/ui/badge/badge.component';
import { EmptyStateComponent } from '../../../../../shared/ui/empty-state/empty-state.component';
import { LoadingComponent } from '../../../../../shared/ui/loading/loading.component';
import { PaginationComponent } from '../../../../../shared/ui/pagination/pagination.component';
import { TableColumn, TableComponent } from '../../../../../shared/ui/table/table.component';
import { ToastService } from '../../../../../shared/ui/toast/toast.service';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';

import { AssignmentApiService } from '../../data-access/assignment-api.service';
import { ClassApiService } from '../../../../admin/classes/data-access/class-api.service';
import { SubjectApiService } from '../../../../admin/subjects/data-access/subject-api.service';

@Component({
  selector: 'app-teacher-assignments-list',
  standalone: true,
  imports: [
    LoadingComponent,
    EmptyStateComponent,
    PaginationComponent,
    TableComponent,
    BadgeComponent,
    ButtonComponent,
  ],
  templateUrl: './assignments-list.component.html',
  styleUrl: './assignments-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignmentsListComponent implements OnInit {
  private readonly assignmentApi = inject(AssignmentApiService);
  private readonly classApi = inject(ClassApiService);
  private readonly subjectApi = inject(SubjectApiService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly assignments = signal<Assignment[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly totalCount = signal(0);
  protected readonly totalPages = signal(1);
  protected readonly hasPreviousPage = signal(false);
  protected readonly hasNextPage = signal(false);

  protected readonly classMap = signal<Record<string, string>>({});
  protected readonly subjectMap = signal<Record<string, string>>({});

  protected readonly displayAssignments = computed(() =>
    this.assignments().map((assignment) => ({
      ...assignment,
      subjectName: this.subjectMap()[assignment.subjectId] ?? 'Unknown subject',
      className: this.classMap()[assignment.classId] ?? 'Unknown class',
    })),
  );

  protected readonly columns: readonly TableColumn<
    Assignment & { subjectName: string; className: string }
  >[] = [
    { key: 'title', label: 'Title' },
    { key: 'subjectName', label: 'Subject' },
    { key: 'className', label: 'Class' },
    { key: 'deadline', label: 'Deadline' },
    { key: 'maxMarks', label: 'Max Marks' },
    { key: 'status', label: 'Status' },
  ];

  ngOnInit(): void {
    this.loadAssignments();
  }

  protected loadAssignments(): void {
    this.loading.set(true);
    this.error.set(null);

    this.assignmentApi.getTeacherAssignments(this.currentPage(), this.pageSize()).subscribe({
      next: (response) => {
        this.assignments.set(response.items);
        this.currentPage.set(response.pageNumber);
        this.pageSize.set(response.pageSize);
        this.totalCount.set(response.totalCount);
        this.totalPages.set(response.totalPages);
        this.hasPreviousPage.set(response.hasPreviousPage);
        this.hasNextPage.set(response.hasNextPage);
        this.loadReferenceData(response.items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load assignments. Please try again.');
        this.toast.error('Failed to load assignments. Please try again.');
      },
    });
  }

  private loadReferenceData(assignments: Assignment[]): void {
    const classIds = [...new Set(assignments.map((assignment) => assignment.classId))];

    if (classIds.length === 0) {
      this.classMap.set({});
      this.subjectMap.set({});
      return;
    }

    forkJoin({
      classes: this.classApi.getClasses(),
      subjectGroups: forkJoin(
        classIds.map((classId) => this.subjectApi.getSubjectsByClass(classId)),
      ),
    }).subscribe({
      next: ({
        classes,
        subjectGroups,
      }: {
        classes: ClassDto[];
        subjectGroups: SubjectDto[][];
      }) => {
        const classLookup: Record<string, string> = {};
        classes.forEach((schoolClass) => {
          classLookup[schoolClass.id] = schoolClass.name;
        });

        const subjectLookup: Record<string, string> = {};
        subjectGroups.flat().forEach((subject) => {
          subjectLookup[subject.id] = subject.name;
        });

        this.classMap.set(classLookup);
        this.subjectMap.set(subjectLookup);
      },
      error: () => {
        this.classMap.set({});
        this.subjectMap.set({});
      },
    });
  }

  protected onPageChanged(page: number): void {
    if (page === this.currentPage()) {
      return;
    }

    this.currentPage.set(page);
    this.loadAssignments();
  }

  protected openAssignment(assignment: Assignment): void {
    this.router.navigate(['/teacher/assignments', assignment.id]);
  }

  protected createAssignment(): void {
    this.router.navigate(['/teacher/assignments/create']);
  }

  protected retry(): void {
    this.loadAssignments();
  }

  protected getStatusVariant(
    status: string,
  ): 'default' | 'success' | 'warning' | 'danger' | 'info' {
    switch (status) {
      case AssignmentStatus.Published:
        return 'success';
      case AssignmentStatus.Draft:
        return 'default';
      default:
        return 'info';
    }
  }
}
