import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { Assignment } from '../../../../../core/models/assignment.model';
import { BadgeComponent } from '../../../../../shared/ui/badge/badge.component';
import { EmptyStateComponent } from '../../../../../shared/ui/empty-state/empty-state.component';
import { LoadingComponent } from '../../../../../shared/ui/loading/loading.component';
import { PaginationComponent } from '../../../../../shared/ui/pagination/pagination.component';
import { TableColumn, TableComponent } from '../../../../../shared/ui/table/table.component';
import { ToastService } from '../../../../../shared/ui/toast/toast.service';

import { AssignmentApiService } from '../../data-access/assignment-api.service';

@Component({
  selector: 'app-assignments-list',
  standalone: true,
  imports: [LoadingComponent, EmptyStateComponent, PaginationComponent, TableComponent, BadgeComponent],
  templateUrl: './assignments-list.component.html',
  styleUrl: './assignments-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignmentsListComponent implements OnInit {
  private readonly assignmentApi = inject(AssignmentApiService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly assignments = signal<Assignment[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly totalPages = signal(1);
  protected readonly hasPreviousPage = signal(false);
  protected readonly hasNextPage = signal(false);
  protected readonly totalCount = signal(0);

  protected readonly columns: readonly TableColumn<Assignment>[] = [
    { key: 'title', label: 'Title' },
    { key: 'deadline', label: 'Deadline' },
    { key: 'maxMarks', label: 'Max Marks' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Created At' },
  ];

  ngOnInit(): void {
    this.loadAssignments();
  }

  protected loadAssignments(): void {
    this.loading.set(true);
    this.error.set(null);

    this.assignmentApi.getAssignments(this.currentPage(), this.pageSize()).subscribe({
      next: (response) => {
        this.assignments.set(response.items);
        this.currentPage.set(response.pageNumber);
        this.pageSize.set(response.pageSize);
        this.totalPages.set(response.totalPages);
        this.totalCount.set(response.totalCount);
        this.hasPreviousPage.set(response.hasPreviousPage);
        this.hasNextPage.set(response.hasNextPage);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load assignments. Please try again.');
        this.toast.error('Failed to load assignments. Please try again.');
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
    this.router.navigate(['/admin/assignments', assignment.id]);
  }

  protected retry(): void {
    this.loadAssignments();
  }
}