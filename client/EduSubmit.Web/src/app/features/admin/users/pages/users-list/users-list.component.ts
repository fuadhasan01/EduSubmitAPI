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
import { ConfirmationDialogComponent } from '../../../../../shared/ui/confirmation-dialog/confirmation-dialog.component';
import { ToastService } from '../../../../../shared/ui/toast/toast.service';

import { UserApiService } from '../../data-access/user-api.service';
import { UserFormModalComponent } from '../../components/user-form-modal/user-form-modal.component';
import { CreateUserRequest, User, UserRole } from '../../../../../core/models/user.model';

interface UserRow {
  id: string;
  fullName: string;
  email: string;
  roleLabel: string;
  statusLabel: string;
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
    ConfirmationDialogComponent,
    UserFormModalComponent,
  ],
  template: `
    <section class="user-list">
      <header class="user-list__header">
        <h1>Users</h1>
        <app-button label="New user" variant="primary" (clicked)="openCreateForm()" />
      </header>

      <app-loading [visible]="loading()" message="Loading users..." />

      @if (!loading()) {
        @if (rows().length > 0) {
          <app-table [columns]="columns" [rows]="rows()" (rowClicked)="onRowClicked($event)" />

          @if (selectedUser(); as user) {
            <div class="user-list__selection">
              <span>{{ user.fullName }} selected</span>
              <app-button
                label="Deactivate"
                variant="danger"
                [disabled]="!user.isActive"
                (clicked)="requestDeactivate()"
              />
              <app-button label="Clear" variant="secondary" (clicked)="clearSelection()" />
            </div>
          }

          <nav class="user-list__pagination" aria-label="Pagination">
            <app-button
              label="Previous"
              variant="secondary"
              [disabled]="pageNumber() <= 1"
              (clicked)="goToPage(pageNumber() - 1)"
            />
            <span
              >Page {{ pageNumber() }} of {{ totalPages() || 1 }} ({{ totalCount() }} users)</span
            >
            <app-button
              label="Next"
              variant="secondary"
              [disabled]="pageNumber() >= totalPages()"
              (clicked)="goToPage(pageNumber() + 1)"
            />
          </nav>
        } @else {
          <app-empty-state
            icon="👤"
            title="No users yet"
            message="Create your first user to get started."
            actionLabel="New user"
            (action)="openCreateForm()"
          />
        }
      }
    </section>

    <app-user-form-modal
      [open]="formOpen()"
      [submitting]="formSubmitting()"
      [serverError]="formError()"
      (submitted)="createUser($event)"
      (cancelled)="closeCreateForm()"
    />

    <app-confirmation-dialog
      [open]="!!deactivateTarget()"
      title="Deactivate user"
      [message]="
        'Are you sure you want to deactivate ' +
        (deactivateTarget()?.fullName ?? '') +
        '? They will no longer be able to sign in.'
      "
      confirmLabel="Deactivate"
      [danger]="true"
      [loading]="deactivating()"
      (confirmed)="confirmDeactivate()"
      (cancelled)="cancelDeactivate()"
    />
  `,
  styleUrl: './user-list.component.scss',
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
      roleLabel: ROLE_LABELS[user.role] ?? 'Unknown',
      statusLabel: user.isActive ? 'Active' : 'Deactivated',
      createdAt: new Date(user.createdAt!).toLocaleDateString(),
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

  protected goToPage(page: number): void {
    if (
      page < 1 ||
      (this.totalPages() > 0 && page > this.totalPages()) ||
      page === this.pageNumber()
    ) {
      return;
    }

    this.pageNumber.set(page);
    this.loadUsers();
  }

  protected onRowClicked(row: UserRow): void {
    this.selectedUserId.set(row.id);
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
    if (!target) {
      return;
    }

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
