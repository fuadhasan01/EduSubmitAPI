import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { Submission } from '../../../../../core/models/submission.model';
import { Assignment } from '../../../../../core/models/assignment.model';
import { ClassDto } from '../../../../../core/models/class.model';
import { SubjectDto } from '../../../../../core/models/subject.model';
import { User, UserRole } from '../../../../../core/models/user.model';
import { BadgeComponent } from '../../../../../shared/ui/badge/badge.component';
import { LoadingComponent } from '../../../../../shared/ui/loading/loading.component';
import { ToastService } from '../../../../../shared/ui/toast/toast.service';

import { SubmissionApiService } from '../../data-access/submission-api.service';
import { AssignmentApiService } from '../../../assignments/data-access/assignment-api.service';
import { ClassApiService } from '../../../classes/data-access/class-api.service';
import { SubjectApiService } from '../../../subjects/data-access/subject-api.service';
import { UserApiService } from '../../../users/data-access/user-api.service';

@Component({
  selector: 'app-admin-submission-detail',
  standalone: true,
  imports: [DatePipe, LoadingComponent, BadgeComponent],
  templateUrl: './submission-detail.component.html',
  styleUrls: ['./submission-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubmissionDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly submissionApi = inject(SubmissionApiService);
  private readonly assignmentApi = inject(AssignmentApiService);
  private readonly classApi = inject(ClassApiService);
  private readonly subjectApi = inject(SubjectApiService);
  private readonly userApi = inject(UserApiService);
  private readonly toast = inject(ToastService);

  protected readonly submission = signal<Submission | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  // Reference data
  protected readonly assignments = signal<Assignment[]>([]);
  protected readonly classes = signal<ClassDto[]>([]);
  protected readonly subjects = signal<SubjectDto[]>([]);
  protected readonly students = signal<User[]>([]);
  protected readonly teachers = signal<User[]>([]);
  protected readonly refsLoading = signal(false);

  // Computed with names
  protected readonly submissionWithNames = computed(() => {
    const sub = this.submission();
    if (!sub) return null;

    const assignMap = new Map(this.assignments().map((a) => [a.id, a]));
    const classMap = new Map(this.classes().map((c) => [c.id, c.name]));
    const subjectMap = new Map(this.subjects().map((s) => [s.id, s.name]));
    const teacherMap = new Map(this.teachers().map((t) => [t.id, t.fullName]));
    const studentMap = new Map(this.students().map((s) => [s.id, s.fullName]));

    const assignment = assignMap.get(sub.assignmentId);
    return {
      ...sub,
      studentName: studentMap.get(sub.studentId) ?? sub.studentId,
      assignmentTitle: assignment?.title ?? sub.assignmentId,
      subjectName: assignment
        ? (subjectMap.get(assignment.subjectId) ?? assignment.subjectId)
        : 'Unknown',
      className: assignment ? (classMap.get(assignment.classId) ?? assignment.classId) : 'Unknown',
      teacherName: assignment
        ? (teacherMap.get(assignment.teacherId) ?? assignment.teacherId)
        : 'Unknown',
    };
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Submission ID is missing.');
      return;
    }
    this.loadReferenceData(id);
  }

  private loadReferenceData(submissionId: string): void {
    this.refsLoading.set(true);

    Promise.all([
      this.classApi.getClasses().toPromise(),
      this.userApi.getUsers(1, 100).toPromise(),
      this.assignmentApi.getAssignments(1, 100).toPromise(),
    ])
      .then(([classes, users, assignmentsResp]) => {
        this.classes.set(classes ?? []);
        const allUsers = users?.items ?? [];
        this.students.set(allUsers.filter((u) => u.role === UserRole.Student && u.isActive));
        this.teachers.set(allUsers.filter((u) => u.role === UserRole.Teacher && u.isActive));
        this.assignments.set(assignmentsResp?.items ?? []);

        const subjectRequests = (classes ?? []).map((c) =>
          this.subjectApi.getSubjectsByClass(c.id).toPromise(),
        );
        return Promise.all(subjectRequests);
      })
      .then((subjectArrays) => {
        this.subjects.set((subjectArrays ?? []).flat().filter((s): s is SubjectDto => !!s));
        this.refsLoading.set(false);
        this.loadSubmission(submissionId);
      })
      .catch((err) => {
        this.refsLoading.set(false);
        this.toast.error('Failed to load reference data.');
        console.error(err);
        this.loadSubmission(submissionId);
      });
  }

  private loadSubmission(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.submissionApi.getSubmissionById(id).subscribe({
      next: (submission) => {
        this.submission.set(submission);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load submission details.');
        this.toast.error('Failed to load submission details.');
      },
    });
  }

  protected goBack(): void {
    this.router.navigate(['/admin/submissions']);
  }

  protected retry(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadSubmission(id);
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
