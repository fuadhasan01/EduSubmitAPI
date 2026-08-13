import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';

import { TableComponent, TableColumn } from '../../../../../shared/ui/table/table.component';
import { LoadingComponent } from '../../../../../shared/ui/loading/loading.component';
import { EmptyStateComponent } from '../../../../../shared/ui/empty-state/empty-state.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { BadgeComponent } from '../../../../../shared/ui/badge/badge.component';
import { PaginationComponent } from '../../../../../shared/ui/pagination/pagination.component';
import { ConfirmationDialogComponent } from '../../../../../shared/ui/confirmation-dialog/confirmation-dialog.component';
import { ToastService } from '../../../../../shared/ui/toast/toast.service';

import { UserApiService } from '../../data-access/user-api.service';
import { UserFormModalComponent } from '../../components/user-form-modal/user-form-modal.component';
import { CreateUserRequest, User, UserRole } from '../../../../../core/models/user.model';

interface UserRow {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  isActive: boolean;
  statusLabel: string;
  statusVariant: 'success' | 'danger';
  createdAt: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.Admin]: 'Admin',
  [UserRole.Teacher]: 'Teacher',
  [UserRole.Student]: 'Student',
};

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    TableComponent,
    LoadingComponent,
    EmptyStateComponent,
    ButtonComponent,
    BadgeComponent,
    PaginationComponent,
    ConfirmationDialogComponent,
    UserFormModalComponent,
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent implements OnInit {
  private readonly userApi = inject(UserApiService);
  private readonly toast = inject(ToastService);

  protected readonly columns: TableColumn<UserRow>[] = [
    { key: 'fullName', label: 'Full name' },
    { key: 'email', label: 'Email' },
    { key: 'roleLabel', label: 'Role' },
    { key: 'statusLabel', label: 'Status' },
    { key: 'createdAt', label: 'Created' },
  ];

  protected readonly users = signal<User[]>([]);
  protected readonly rows = computed<UserRow[]>(() =>
    this.users().map((user) => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      roleLabel: ROLE_LABELS[user.role] ?? 'Unknown',
      isActive: user.isActive,
      statusLabel: user.isActive ? 'Active' : 'Deactivated',
      statusVariant: user.isActive ? 'success' : 'danger',
      createdAt: new Date(user.createdAt!).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    })),
  );

  protected readonly loading = signal(false);
  protected readonly pageNumber = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly totalPages = signal(0);
  protected readonly totalCount = signal(0);

  protected readonly formOpen = signal(false);
  protected readonly formSubmitting = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly selectedUserId = signal<string | null>(null);
  protected readonly selectedUser = computed(
    () => this.users().find((u) => u.id === this.selectedUserId()) ?? null,
  );

  protected readonly deactivateTarget = signal<User | null>(null);
  protected readonly deactivating = signal(false);

  ngOnInit(): void {
    this.loadUsers();
  }

  protected loadUsers(): void {
    this.loading.set(true);

    this.userApi.getUsers(this.pageNumber(), this.pageSize()).subscribe({
      next: (response) => {
        this.users.set(response.items);
        this.totalPages.set(response.totalPages);
        this.totalCount.set(response.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Failed to load users. Please try again.');
      },
    });
  }

  protected onPageChanged(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.pageNumber()) {
      return;
    }
    this.pageNumber.set(page);
    this.loadUsers();
    this.clearSelection();
  }

  protected onRowClicked(row: UserRow): void {
    // Toggle selection: if same row, deselect; otherwise select the new row
    if (this.selectedUserId() === row.id) {
      this.clearSelection();
    } else {
      this.selectedUserId.set(row.id);
    }
  }

  protected clearSelection(): void {
    this.selectedUserId.set(null);
  }

  protected openCreateForm(): void {
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected closeCreateForm(): void {
    this.formOpen.set(false);
  }

  protected createUser(request: CreateUserRequest): void {
    this.formSubmitting.set(true);
    this.formError.set(null);

    this.userApi.createUser(request).subscribe({
      next: () => {
        this.formSubmitting.set(false);
        this.formOpen.set(false);
        this.toast.success('User created successfully.');
        this.pageNumber.set(1);
        this.loadUsers();
      },
      error: (err) => {
        this.formSubmitting.set(false);
        this.formError.set(err?.error?.detail ?? err?.error?.title ?? 'Failed to create user.');
      },
    });
  }

  protected requestDeactivate(): void {
    const user = this.selectedUser();
    if (user) {
      this.deactivateTarget.set(user);
    }
  }

  protected cancelDeactivate(): void {
    this.deactivateTarget.set(null);
  }

  protected confirmDeactivate(): void {
    const target = this.deactivateTarget();
    if (!target) return;

    this.deactivating.set(true);

    this.userApi.deactivateUser(target.id).subscribe({
      next: () => {
        this.deactivating.set(false);
        this.deactivateTarget.set(null);
        this.selectedUserId.set(null);
        this.toast.success(`${target.fullName} has been deactivated.`);
        this.loadUsers();
      },
      error: () => {
        this.deactivating.set(false);
        this.toast.error('Failed to deactivate user. Please try again.');
      },
    });
  }
}
