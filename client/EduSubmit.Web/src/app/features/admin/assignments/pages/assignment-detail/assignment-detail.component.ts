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

import { Assignment, AssignmentStatus } from '../../../../../core/models/assignment.model';
import { ClassDto } from '../../../../../core/models/class.model';
import { SubjectDto } from '../../../../../core/models/subject.model';
import { User, UserRole } from '../../../../../core/models/user.model';
import { BadgeComponent } from '../../../../../shared/ui/badge/badge.component';
import { LoadingComponent } from '../../../../../shared/ui/loading/loading.component';
import { ToastService } from '../../../../../shared/ui/toast/toast.service';

import { AssignmentApiService } from '../../data-access/assignment-api.service';
import { ClassApiService } from '../../../classes/data-access/class-api.service';
import { SubjectApiService } from '../../../subjects/data-access/subject-api.service';
import { UserApiService } from '../../../users/data-access/user-api.service';

@Component({
  selector: 'app-assignment-detail',
  standalone: true,
  imports: [DatePipe, LoadingComponent, BadgeComponent],
  templateUrl: './assignment-detail.component.html',
  styleUrls: ['./assignment-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignmentDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly assignmentApi = inject(AssignmentApiService);
  private readonly classApi = inject(ClassApiService);
  private readonly subjectApi = inject(SubjectApiService);
  private readonly userApi = inject(UserApiService);
  private readonly toast = inject(ToastService);

  protected readonly assignment = signal<Assignment | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  // Reference data
  protected readonly classes = signal<ClassDto[]>([]);
  protected readonly subjects = signal<SubjectDto[]>([]);
  protected readonly teachers = signal<User[]>([]);
  protected readonly refsLoading = signal(false);

  // Computed with names
  protected readonly assignmentWithNames = computed(() => {
    const a = this.assignment();
    if (!a) return null;

    const classMap = new Map(this.classes().map((c) => [c.id, c.name]));
    const subjectMap = new Map(this.subjects().map((s) => [s.id, s.name]));
    const teacherMap = new Map(this.teachers().map((t) => [t.id, t.fullName]));

    return {
      ...a,
      className: a.className ?? classMap.get(a.classId) ?? a.classId,
      subjectName: a.subjectName ?? subjectMap.get(a.subjectId) ?? a.subjectId,
      teacherName: a.teacherName ?? teacherMap.get(a.teacherId) ?? a.teacherId,
    };
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Assignment ID is missing.');
      return;
    }
    this.loadReferenceData(id);
  }

  private loadReferenceData(assignmentId: string): void {
    this.refsLoading.set(true);

    // Load classes, subjects, teachers (same as list)
    this.classApi.getClasses().subscribe({
      next: (classes) => {
        this.classes.set(classes);
        const subjectRequests = classes.map((c) => this.subjectApi.getSubjectsByClass(c.id));
        Promise.all(subjectRequests.map((req) => req.toPromise()))
          .then((subjectArrays) => {
            this.subjects.set(subjectArrays.flat().filter((v): v is SubjectDto => !!v));
            this.userApi.getUsers(1, 100).subscribe({
              next: (response) => {
                this.teachers.set(
                  response.items.filter((u) => u.role === UserRole.Teacher && u.isActive),
                );
                this.refsLoading.set(false);
                this.loadAssignment(assignmentId);
              },
              error: () => {
                this.refsLoading.set(false);
                this.toast.error('Failed to load teachers.');
                this.loadAssignment(assignmentId);
              },
            });
          })
          .catch(() => {
            this.refsLoading.set(false);
            this.toast.error('Failed to load subjects.');
            this.loadAssignment(assignmentId);
          });
      },
      error: () => {
        this.refsLoading.set(false);
        this.toast.error('Failed to load classes.');
        this.loadAssignment(assignmentId);
      },
    });
  }

  private loadAssignment(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.assignmentApi.getAssignmentById(id).subscribe({
      next: (assignment) => {
        this.assignment.set(assignment);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load assignment details.');
        this.toast.error('Failed to load assignment details.');
      },
    });
  }

  protected goBack(): void {
    this.router.navigate(['/admin/assignments']);
  }

  protected retry(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadAssignment(id);
  }

  protected getStatusVariant(
    status: string,
  ): 'default' | 'success' | 'warning' | 'danger' | 'info' {
    return status === AssignmentStatus.Published ? 'success' : 'default';
  }
}
