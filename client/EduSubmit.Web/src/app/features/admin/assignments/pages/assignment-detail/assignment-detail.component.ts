import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { Assignment, AssignmentStatus } from '../../../../../core/models/assignment.model';
import { BadgeComponent } from '../../../../../shared/ui/badge/badge.component';
import { LoadingComponent } from '../../../../../shared/ui/loading/loading.component';
import { ToastService } from '../../../../../shared/ui/toast/toast.service';

import { AssignmentApiService } from '../../data-access/assignment-api.service';

@Component({
  selector: 'app-assignment-detail',
  standalone: true,
  imports: [DatePipe, LoadingComponent, BadgeComponent],
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

  protected goBack(): void {
    this.router.navigate(['/admin/assignments']);
  }

  protected retry(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.loadAssignment(id);
    }
  }

  protected getStatusVariant(status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' {
    return status === AssignmentStatus.Published ? 'success' : 'default';
  }
}