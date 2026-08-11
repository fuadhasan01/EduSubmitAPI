import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ModalComponent } from '../../../../../shared/ui/modal/modal.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { CreateUserRequest, UserRole } from '../../../../../core/models/user.model';

@Component({
  selector: 'app-user-form-modal',
  standalone: true,
  imports: [ReactiveFormsModule, ModalComponent, ButtonComponent],
  template: `
    <app-modal [open]="open()" title="Create user" (closed)="close()">
      <form class="user-form" (ngSubmit)="onSubmit()" [formGroup]="form">
        <label class="user-form__field">
          <span>Full name</span>
          <input type="text" formControlName="fullName" autocomplete="name" />
          @if (form.controls.fullName.touched && form.controls.fullName.invalid) {
            <small class="user-form__error">Full name is required.</small>
          }
        </label>

        <label class="user-form__field">
          <span>Email</span>
          <input type="email" formControlName="email" autocomplete="email" />
          @if (form.controls.email.touched && form.controls.email.invalid) {
            <small class="user-form__error">Enter a valid email address.</small>
          }
        </label>

        <label class="user-form__field">
          <span>Password</span>
          <input type="password" formControlName="password" autocomplete="new-password" />
          @if (form.controls.password.touched && form.controls.password.invalid) {
            <small class="user-form__error">Password must be at least 6 characters.</small>
          }
        </label>

        <label class="user-form__field">
          <span>Role</span>
          <select formControlName="role">
            @for (role of roles; track role.value) {
              <option [value]="role.value">{{ role.label }}</option>
            }
          </select>
        </label>

        @if (serverError()) {
          <p class="user-form__error user-form__error--server">{{ serverError() }}</p>
        }

        <div class="user-form__actions">
          <app-button type="button" label="Cancel" variant="secondary" (clicked)="close()" />
          <app-button
            type="submit"
            label="Create user"
            variant="primary"
            [loading]="submitting()"
          />
        </div>
      </form>
    </app-modal>
  `,
  styleUrl: './user-form-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormModalComponent {
  private readonly fb = inject(FormBuilder);

  readonly open = input(false);
  readonly submitting = input(false);
  readonly serverError = input<string | null>(null);

  readonly submitted = output<CreateUserRequest>();
  readonly cancelled = output<void>();

  protected readonly roles = [
    { value: UserRole.Admin, label: 'Admin' },
    { value: UserRole.Teacher, label: 'Teacher' },
    { value: UserRole.Student, label: 'Student' },
  ];

  protected readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: [UserRole.Student, [Validators.required]],
  });

  constructor() {
    effect(() => {
      if (!this.open()) {
        this.form.reset({ fullName: '', email: '', password: '', role: UserRole.Student });
      }
    });
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit(this.form.getRawValue());
  }

  protected close(): void {
    this.cancelled.emit();
  }
}
