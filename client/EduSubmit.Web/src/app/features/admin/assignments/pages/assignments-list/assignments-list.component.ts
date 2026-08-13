import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import { Assignment } from '../../../../../core/models/assignment.model';
import { ClassDto } from '../../../../../core/models/class.model';
import { SubjectDto } from '../../../../../core/models/subject.model';
import { User, UserRole } from '../../../../../core/models/user.model';
import { BadgeComponent } from '../../../../../shared/ui/badge/badge.component';
import { LoadingComponent } from '../../../../../shared/ui/loading/loading.component';
import { EmptyStateComponent } from '../../../../../shared/ui/empty-state/empty-state.component';
import { PaginationComponent } from '../../../../../shared/ui/pagination/pagination.component';
import { ToastService } from '../../../../../shared/ui/toast/toast.service';

import { AssignmentApiService } from '../../data-access/assignment-api.service';
import { ClassApiService } from '../../../classes/data-access/class-api.service';
import { SubjectApiService } from '../../../subjects/data-access/subject-api.service';
import { UserApiService } from '../../../users/data-access/user-api.service';

@Component({
  selector: 'app-assignment-list',
  standalone: true,
  imports: [DatePipe, BadgeComponent, LoadingComponent, EmptyStateComponent, PaginationComponent],
  templateUrl: './assignments-list.component.html',
  styleUrl: './assignments-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignmentListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly assignmentApi = inject(AssignmentApiService);
  private readonly classApi = inject(ClassApiService);
  private readonly subjectApi = inject(SubjectApiService);
  private readonly userApi = inject(UserApiService);
  private readonly toast = inject(ToastService);

  // Data signals
  protected readonly assignments = signal<Assignment[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  // Pagination
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly totalPages = signal(0);
  protected readonly totalCount = signal(0);
  protected readonly hasPreviousPage = signal(false);
  protected readonly hasNextPage = signal(false);

  // Reference data for names
  protected readonly classes = signal<ClassDto[]>([]);
  protected readonly subjects = signal<SubjectDto[]>([]);
  protected readonly teachers = signal<User[]>([]);
  protected readonly refsLoading = signal(false);

  // Computed assignments with names
  protected readonly assignmentsWithNames = computed(() => {
    const assign = this.assignments();
    const classMap = new Map(this.classes().map((c) => [c.id, c.name]));
    const subjectMap = new Map(this.subjects().map((s) => [s.id, s.name]));
    const teacherMap = new Map(this.teachers().map((t) => [t.id, t.fullName]));

    return assign.map((a) => ({
      ...a,
      className: classMap.get(a.classId) ?? a.classId,
      subjectName: subjectMap.get(a.subjectId) ?? a.subjectId,
      teacherName: teacherMap.get(a.teacherId) ?? a.teacherId,
    }));
  });

  ngOnInit(): void {
    this.loadReferenceData();
  }

  private loadReferenceData(): void {
    this.refsLoading.set(true);

    // Load classes, subjects, teachers
    this.classApi.getClasses().subscribe({
      next: (classes) => {
        this.classes.set(classes);
        // Load subjects for each class
        const subjectRequests = classes.map((c) => this.subjectApi.getSubjectsByClass(c.id));
        // Use forkJoin or Promise.all – we'll use toPromise with Promise.all
        Promise.all(subjectRequests.map((req) => req.toPromise()))
          .then((subjectArrays) => {
            const allSubjects = subjectArrays.flat();
            this.subjects.set(allSubjects.filter((s): s is SubjectDto => s !== undefined));
            // Load teachers
            this.userApi.getUsers(1, 100).subscribe({
              next: (response) => {
                this.teachers.set(
                  response.items.filter((u) => u.role === UserRole.Teacher && u.isActive),
                );
                this.refsLoading.set(false);
                this.loadAssignments();
              },
              error: () => {
                this.refsLoading.set(false);
                this.toast.error('Failed to load teachers.');
                this.loadAssignments(); // still load assignments
              },
            });
          })
          .catch(() => {
            this.refsLoading.set(false);
            this.toast.error('Failed to load subjects.');
            this.loadAssignments();
          });
      },
      error: () => {
        this.refsLoading.set(false);
        this.toast.error('Failed to load classes.');
        this.loadAssignments();
      },
    });
  }

  private loadAssignments(): void {
    this.loading.set(true);
    this.error.set(null);

    this.assignmentApi.getAssignments(this.currentPage(), this.pageSize()).subscribe({
      next: (response) => {
        this.assignments.set(response.items);
        this.totalPages.set(response.totalPages);
        this.totalCount.set(response.totalCount);
        this.hasPreviousPage.set(response.hasPreviousPage);
        this.hasNextPage.set(response.hasNextPage);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load assignments. Please try again.');
        this.toast.error('Failed to load assignments.');
      },
    });
  }

  protected onPageChanged(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) {
      return;
    }
    this.currentPage.set(page);
    this.loadAssignments();
  }

  protected openAssignment(assignment: Assignment): void {
    this.router.navigate(['/admin/assignments', assignment.id]);
  }

  protected retry(): void {
    this.loadAssignments();
  }
}
