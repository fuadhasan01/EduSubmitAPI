import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Assignment, AssignmentStatus } from '../../../../../core/models/assignment.model';
import { BadgeComponent } from '../../../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { LoadingComponent } from '../../../../../shared/ui/loading/loading.component';
import { ToastService } from '../../../../../shared/ui/toast/toast.service';

import { AssignmentApiService } from '../../data-access/assignment-api.service';

@Component({
  selector: 'app-teacher-assignment-detail',
  standalone: true,
  imports: [DatePipe, LoadingComponent, BadgeComponent, ButtonComponent],
  templateUrl: './assignment-detail.component.html',
  styleUrl: './assignment-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignmentDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly assignmentApi = inject(AssignmentApiService);
  private readonly toast = inject(ToastService);

  protected readonly assignment = signal<Assignment | null>(null);
  protected readonly loading = signal(false);
  protected readonly actionLoading = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('Assignment ID is missing.');
      return;
    }

    this.loadAssignment(id);
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

  protected edit(): void {
    const item = this.assignment();

    if (item) {
      this.router.navigate(['/teacher/assignments', item.id, 'edit']);
    }
  }

  protected publish(): void {
    const item = this.assignment();

    if (!item) {
      return;
    }

    this.actionLoading.set(true);

    this.assignmentApi.publishAssignment(item.id).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.toast.success('Assignment published successfully.');
        this.loadAssignment(item.id);
      },
      error: (err) => {
        this.actionLoading.set(false);
        this.toast.error(
          err?.error?.detail ??
            err?.error?.title ??
            'Failed to publish assignment.',
        );
      },
    });
  }

  protected unpublish(): void {
    const item = this.assignment();

    if (!item) {
      return;
    }

    this.actionLoading.set(true);

    this.assignmentApi.unpublishAssignment(item.id).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.toast.success('Assignment unpublished successfully.');
        this.loadAssignment(item.id);
      },
      error: (err) => {
        this.actionLoading.set(false);
        this.toast.error(
          err?.error?.detail ??
            err?.error?.title ??
            'Failed to unpublish assignment.',
        );
      },
    });
  }

  protected deleteAssignment(): void {
    const item = this.assignment();

    if (!item) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    this.actionLoading.set(true);

    this.assignmentApi.deleteAssignment(item.id).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.toast.success('Assignment deleted successfully.');
        this.router.navigate(['/teacher/assignments']);
      },
      error: (err) => {
        this.actionLoading.set(false);
        this.toast.error(
          err?.error?.detail ??
            err?.error?.title ??
            'Failed to delete assignment.',
        );
      },
    });
  }

  protected goBack(): void {
    this.router.navigate(['/teacher/assignments']);
  }

  protected retry(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.loadAssignment(id);
    }
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