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

import { Submission } from '../../../../../core/models/submission.model';
import { Assignment } from '../../../../../core/models/assignment.model';
import { ClassDto } from '../../../../../core/models/class.model';
import { SubjectDto } from '../../../../../core/models/subject.model';
import { User, UserRole } from '../../../../../core/models/user.model';
import { BadgeComponent } from '../../../../../shared/ui/badge/badge.component';
import { LoadingComponent } from '../../../../../shared/ui/loading/loading.component';
import { EmptyStateComponent } from '../../../../../shared/ui/empty-state/empty-state.component';
import { PaginationComponent } from '../../../../../shared/ui/pagination/pagination.component';
import { ToastService } from '../../../../../shared/ui/toast/toast.service';

import { SubmissionApiService } from '../../data-access/submission-api.service';
import { AssignmentApiService } from '../../../assignments/data-access/assignment-api.service';
import { ClassApiService } from '../../../classes/data-access/class-api.service';
import { SubjectApiService } from '../../../subjects/data-access/subject-api.service';
import { UserApiService } from '../../../users/data-access/user-api.service';

@Component({
  selector: 'app-admin-submission-list',
  standalone: true,
  imports: [DatePipe, BadgeComponent, LoadingComponent, EmptyStateComponent, PaginationComponent],
  templateUrl: './submissions-list.component.html',
  styleUrl: './submissions-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubmissionsListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly submissionApi = inject(SubmissionApiService);
  private readonly assignmentApi = inject(AssignmentApiService);
  private readonly classApi = inject(ClassApiService);
  private readonly subjectApi = inject(SubjectApiService);
  private readonly userApi = inject(UserApiService);
  private readonly toast = inject(ToastService);

  // Data signals
  protected readonly submissions = signal<Submission[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  // Pagination
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly totalPages = signal(0);
  protected readonly totalCount = signal(0);
  protected readonly hasPreviousPage = signal(false);
  protected readonly hasNextPage = signal(false);

  // Reference data
  protected readonly assignments = signal<Assignment[]>([]);
  protected readonly classes = signal<ClassDto[]>([]);
  protected readonly subjects = signal<SubjectDto[]>([]);
  protected readonly students = signal<User[]>([]);
  protected readonly teachers = signal<User[]>([]);
  protected readonly refsLoading = signal(false);

  // Computed submissions with names
  protected readonly submissionsWithNames = computed(() => {
    const subs = this.submissions();
    const assignMap = new Map(this.assignments().map((a) => [a.id, a]));
    const classMap = new Map(this.classes().map((c) => [c.id, c.name]));
    const subjectMap = new Map(this.subjects().map((s) => [s.id, s.name]));
    const teacherMap = new Map(this.teachers().map((t) => [t.id, t.fullName]));
    const studentMap = new Map(this.students().map((s) => [s.id, s.fullName]));

    return subs.map((s) => {
      const assignment = assignMap.get(s.assignmentId);
      return {
        ...s,
        studentName: studentMap.get(s.studentId) ?? s.studentId,
        assignmentTitle: assignment?.title ?? s.assignmentId,
        subjectName: assignment
          ? (subjectMap.get(assignment.subjectId) ?? assignment.subjectId)
          : 'Unknown',
        className: assignment
          ? (classMap.get(assignment.classId) ?? assignment.classId)
          : 'Unknown',
        teacherName: assignment
          ? (teacherMap.get(assignment.teacherId) ?? assignment.teacherId)
          : 'Unknown',
      };
    });
  });

  ngOnInit(): void {
    this.loadReferenceData();
  }

  private loadReferenceData(): void {
    this.refsLoading.set(true);

    // Load all required data in parallel
    Promise.all([
      this.classApi.getClasses().toPromise(),
      this.userApi.getUsers(1, 100).toPromise(),
      this.assignmentApi.getAssignments(1, 100).toPromise(), // get all assignments for mapping
    ])
      .then(([classes, users, assignmentsResp]) => {
        this.classes.set(classes ?? []);
        const allUsers = users?.items ?? [];
        this.students.set(allUsers.filter((u) => u.role === UserRole.Student && u.isActive));
        this.teachers.set(allUsers.filter((u) => u.role === UserRole.Teacher && u.isActive));
        this.assignments.set(assignmentsResp?.items ?? []);

        // Now load subjects for each class
        const subjectRequests = (classes ?? []).map((c) =>
          this.subjectApi.getSubjectsByClass(c.id).toPromise(),
        );
        return Promise.all(subjectRequests);
      })
      .then((subjectArrays) => {
        const allSubjects = (subjectArrays ?? []).flat();
        this.subjects.set(allSubjects.filter((s): s is SubjectDto => !!s));
        this.refsLoading.set(false);
        this.loadSubmissions();
      })
      .catch((err) => {
        this.refsLoading.set(false);
        this.toast.error('Failed to load reference data.');
        console.error(err);
        // Still try to load submissions without names
        this.loadSubmissions();
      });
  }

  private loadSubmissions(): void {
    this.loading.set(true);
    this.error.set(null);

    this.submissionApi.getSubmissions(this.currentPage(), this.pageSize()).subscribe({
      next: (response) => {
        this.submissions.set(response.items);
        this.totalPages.set(response.totalPages);
        this.totalCount.set(response.totalCount);
        this.hasPreviousPage.set(response.hasPreviousPage);
        this.hasNextPage.set(response.hasNextPage);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load submissions. Please try again.');
        this.toast.error('Failed to load submissions.');
      },
    });
  }

  protected onPageChanged(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    this.currentPage.set(page);
    this.loadSubmissions();
  }

  protected openSubmission(submission: Submission): void {
    this.router.navigate(['/admin/submissions', submission.id]);
  }

  protected retry(): void {
    this.loadSubmissions();
  }

  protected getStatusVariant(
    status: string,
  ): 'default' | 'success' | 'warning' | 'danger' | 'info' {
    const map: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
      Submitted: 'info',
      Late: 'warning',
      Graded: 'success',
      ReturnedForRevision: 'danger',
    };
    return map[status] ?? 'default';
  }
}
