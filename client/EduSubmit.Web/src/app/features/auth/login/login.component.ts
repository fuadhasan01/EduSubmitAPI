import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthState } from '../../../core/auth/auth-state.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent],
  template: `
    <div class="login-page">
      <form class="login-card" [formGroup]="form" (ngSubmit)="onSubmit()">
        <h1>EduSubmit</h1>
        <p class="login-card__subtitle">Sign in to continue</p>

        <label class="login-field">
          <span>Email</span>
          <input
            type="email"
            formControlName="email"
            autocomplete="email"
            [attr.aria-invalid]="form.controls.email.touched && form.controls.email.invalid"
          />
          @if (form.controls.email.touched && form.controls.email.hasError('required')) {
            <small class="login-field__error">Email is required.</small>
          }
          @if (form.controls.email.touched && form.controls.email.hasError('email')) {
            <small class="login-field__error">Enter a valid email address.</small>
          }
        </label>

        <label class="login-field">
          <span>Password</span>
          <input
            type="password"
            formControlName="password"
            autocomplete="current-password"
            [attr.aria-invalid]="form.controls.password.touched && form.controls.password.invalid"
          />
          @if (form.controls.password.touched && form.controls.password.hasError('required')) {
            <small class="login-field__error">Password is required.</small>
          }
        </label>

        @if (serverError()) {
          <p class="login-card__error" role="alert">{{ serverError() }}</p>
        }

        <app-button
          type="submit"
          label="Sign in"
          loadingLabel="Signing in..."
          variant="primary"
          [fullWidth]="true"
          [loading]="loading()"
        />
      </form>
    </div>
  `,
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authState = inject(AuthState);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly loading = signal(false);
  protected readonly serverError = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.serverError.set(null);

    this.authState.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.redirectAfterLogin();
      },
      error: (err) => {
        this.loading.set(false);
        this.serverError.set(
          err?.error?.detail ??
            err?.error?.title ??
            err?.error?.message ??
            'Invalid email or password.',
        );
      },
    });
  }

  private redirectAfterLogin(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const defaultRoute = this.getDefaultRouteForRole(this.authState.role());

    this.router.navigateByUrl(returnUrl ?? defaultRoute);
  }

  private getDefaultRouteForRole(role: string | null): string {
    switch (role) {
      case 'Admin':
        return '/admin';
      case 'Teacher':
        return '/teacher';
      case 'Student':
        return '/student';
      default:
        return '/login';
    }
  }
}
